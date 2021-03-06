from iati.models import Narrative
import csv
from dateutil import parser as data_parser
from django.core.exceptions import ObjectDoesNotExist

narratives = []

def add_narrative(text, parent, activity):
    if not text:
        return None
    language = Language.objects.get(pk='en')
    register_name = parent.__class__.__name__ + "Narrative"
    narrative = Narrative()
    narrative.language = language
    narrative.content = text
    narrative.related_object = parent
    narrative.activity = activity
    narratives.append(narrative)
    return parent

def update_narrative(text, model, activity):
    if not text:
        return None
    if model.narratives.count():
        #replace narrative
        narrative = model.narratives.all()[0]
        narrative.content = text
        narrative.save()
    else:
        # add narrative
        n = add_narrative(text, model, activity)
        n.save()
    return model

def set_or_update_result(row, activity):
    # get or create result_id
    if row['result_id']:
        # update
        result = Result.objects.get(pk=row['result_id'])
        try:
            rt = update_narrative(row['result_title'], result.resulttitle, activity)
        except ObjectDoesNotExist:
            rt = add_narrative(row['result_title'], ResultTitle(), activity)
        try:
            rd = update_narrative(row['result_description'], result.resultdescription, activity)
        except ObjectDoesNotExist:
            rd = add_narrative(row['result_description'], ResultDescription(), activity)
    else:
        # create
        result = Result(
            activity=activity,
            aggregation_status=row['result_aggregation_status'])
        rt = add_narrative(row['result_title'], ResultTitle(), activity)
        rd = add_narrative(row['result_description'], ResultDescription(), activity)
    #
    result.type = ResultType.objects.get(code=row['result_type'])
    result.save()
    rt.result = result
    rt.save()
    if rd:
        rd.result = result
        rd.save()
    return result

def set_or_update_result_indicator(row, activity, result):
    # get or create result_indicator_id
    if row['result_indicator_id']:
        # update
        ri = ResultIndicator.objects.get(pk=row['result_indicator_id'])
        ri.baseline_year = row['result_baseline_year']
        ri.baseline_value = row['result_baseline_value']
        try:
            ri.resultindicatortitle.primary_name = row['result_indicator_title']
            ri.resultindicatortitle.save()
            rit = update_narrative(row['result_indicator_title'], ri.resultindicatortitle, activity)
        except ObjectDoesNotExist:
            rit = add_narrative(row['result_indicator_title'], ResultIndicatorTitle(primary_name=row['result_indicator_title']), activity)
        try:
            rid = update_narrative(row['result_indicator_description'], ri.resultindicatordescription, activity)
        except ObjectDoesNotExist:
            rid = add_narrative(row['result_indicator_description'], ResultIndicatorDescription(), activity)
    else:
        # create
        ri = ResultIndicator(
            result=result,
            baseline_year=row['result_baseline_year'],
            baseline_value=row['result_baseline_value'],
            ascending=True)
        rit = add_narrative(row['result_indicator_title'], ResultIndicatorTitle(primary_name=row['result_indicator_title']), activity)
        rid = add_narrative(row['result_indicator_description'], ResultIndicatorDescription(), activity)
    ri.measure = IndicatorMeasure.objects.get(code='1')
    # unused for now
    # if row['result_baseline_comment']:
    #     rbc = add_narrative(row['result_baseline_comment'], ResultIndicatorBaselineComment(), activity)
    ri.save()
    rit.result_indicator = ri
    rit.save()
    if rid:
        rid.result_indicator = ri
        rid.save()
    return ri

def set_or_update_result_indicator_period(row, activity, result_indicator):
    # get or create result_indicator_period_id
    # print row['result_period_start_date']
    # print row['result_period_end_date']
    period_start = data_parser.parse(row['result_period_start_date'], ignoretz=True)
    period_end = data_parser.parse(row['result_period_end_date'], ignoretz=True)
    result_period_target = row['result_period_target']
    result_period_actual = row['result_period_actual']
    if not result_period_target:
        result_period_target = None
    if not result_period_actual:
        result_period_actual = None
    if row['result_indicator_period_id']:
        # update
        rip = ResultIndicatorPeriod.objects.get(pk=row['result_indicator_period_id'])
        try:
            riptc = update_narrative(row['result_period_target_comment'], rip.resultindicatorperiodtargetcomment, activity)
        except ObjectDoesNotExist:
            riptc = add_narrative(row['result_period_target_comment'], ResultIndicatorPeriodTargetComment(), activity)
        try:
            ripac = update_narrative(row['result_period_actual_comment'], rip.resultindicatorperiodactualcomment, activity)
        except ObjectDoesNotExist:
            ripac = add_narrative(row['result_period_actual_comment'], ResultIndicatorPeriodActualComment(), activity)
    else:
        # create
        rip = ResultIndicatorPeriod(result_indicator=result_indicator)
        riptc = add_narrative(row['result_period_target_comment'], ResultIndicatorPeriodTargetComment(), activity)
        ripac = add_narrative(row['result_period_actual_comment'], ResultIndicatorPeriodActualComment(), activity)
    rip.period_start = period_start
    rip.period_end = period_end
    rip.target = result_period_target
    rip.actual = result_period_actual
    #
    rip.save()
    if riptc:
        riptc.result_indicator_period = rip
        riptc.save()
    if ripac:
        ripac.result_indicator_period = rip
        ripac.save()
    return rip

with open('joined.csv') as csvfile:
    reader = csv.DictReader(csvfile, dialect=csv.excel)
    #
    previous_row = None
    first_row = True
    previous_result = None
    previous_result_indicator = None
    previous_result_indicator_period = None
    #
    for index, row in enumerate(reader):
        # init
        narratives = []
        # check if valid row
        # required fields; result title, indicator title, 
        if not row['result_title'] or not row['result_indicator_title'] or not row['result_period_start_date'] or not row['result_period_end_date']:
            print 'invalid row, line ' + str(index+2)
            continue
        #
        row['result_title'] =row['result_title'].strip()
        row['result_indicator_title'] =row['result_indicator_title'].strip()
        #
        print 'line ' + str(index+2)
        activity = Activity.objects.get(pk=row['activity_id'])
        #
        if not first_row and previous_row['activity_id'] is row['activity_id'] and previous_row['result_title'] is row['result_title'] and previous_row['result_indicator_title'] is row['result_indicator_title']:
            # only save result indicator period
            result = previous_result
            result_indicator = previous_result_indicator
            result_indicator_period = set_or_update_result_indicator_period(row, activity, previous_result_indicator)
        elif not first_row and previous_row['activity_id'] is row['activity_id'] and previous_row['result_title'] is row['result_title']:
            # save both result indicator and result indicator period
            result = previous_result
            result_indicator = set_or_update_result_indicator(row, activity, result)
            result_indicator_period = set_or_update_result_indicator_period(row, activity, result_indicator)
        else:
            result = set_or_update_result(row, activity)
            result_indicator = set_or_update_result_indicator(row, activity, result)
            result_indicator_period = set_or_update_result_indicator_period(row, activity, result_indicator)
        # save all
        for n in narratives:
            n.content = n.content.decode('utf-8', 'ignore')
            n.related_object_id = n.related_object.id
            n.save()
        # keep data from previous row to do checks
        previous_row = row
        previous_result = result
        previous_result_indicator = result_indicator
        previous_result_indicator_period = result_indicator_period
        first_row = False




