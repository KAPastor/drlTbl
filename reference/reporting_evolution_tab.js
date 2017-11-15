function initialize_reporting_evolution_tab(){
    $.get("/static/DEM/obj_html/reporting_evolution_tab.html", function( html) {
        $('#reporting_evolution_tab').html('');
        $('#reporting_evolution_tab').append(html);
        updateReportingOptions();
    });
}


function generateReport(){ //What is called on the button click
    $('table#reportingTable > tbody > tr').remove();
    $('table#reportingTable > thead > tr > th').remove();
    //Alrighty!  Let's grab all the needed data:

    var data = new FormData();
    data.append('baseScen',$('#baseScen').val()); // Get the base scenario
    data.append('compScen',$('#compScen').val()); // Get the comparison scenario
    data.append('rateName','NULL'); // Pass the step

  //Rate condition:
  if($('#reportType').val() == 'rate_path'){
    data.append('rateName',$('select#rateName').val()); // Pass the step
  }


  //Update the report step:
  report_step = -1;
  if($('select#reportStep').is(':visible')){
    //If it is visible grab and populate the step:
    report_step = $('select#reportStep').val()
  }
  data.append('reportStep',report_step); // Pass the step
  data.append( 'reportType', $('#reportType').val()); // Add the report type to be sent

    $.ajax({
        url: ajax_base_str+'initReportGen/',
        type: 'POST',
        data:data,
        cache: false,
        contentType: false,
        processData: false,
        success: function(result) {

            //Take the results and make a table, then update the graph:
            //Assume that the first row is the header for the table:
            headerString = '';
            bodyString = '';
            console.log(result)
            $.each(result['reportData'],function(idx,val){
                if (idx==0){ //Produce the headers
                    $.each(val,function(idxHead,valHead){
                        if(idxHead==0){
                            headerString = headerString + '<th class="column-title">' + valHead + '</th>'
                        }else{
                            headerString = headerString + '<th class="column-title">' + valHead + '</th>'
                        }
                    });
                }else{
                    bodyString = bodyString  + '<tr level="1" isActive="false">';
                    $.each(val,function(idxBody,valBody){
                        if (idxBody ==0){
                            bodyString = bodyString + '<td name="' + valBody + '" class="reportCell"><strong>' + valBody + '</strong></td>'
                        }else{
                            if ($('#reportType').val() == 'dv01_t'){
                              bodyString = bodyString + '<td>' + valBody + '</td>'

                            }else{
                              bodyString = bodyString + '<td>' + valBody + '</td>'
                            }
                        }
                    });
                    bodyString = bodyString  + '</tr>';
                }
                updateClickEvents();
            });

            $('#reportingTable > thead > tr').append(headerString)
            $('#reportingTable > tbody').append(bodyString)

            //updateClickEvents();
            initReportingPlot();
            //updateReportingPlot();
            //Grab the last row and make this the plot (generally this will be the net value)

        },
        error: function(result){

        }
    });

    $('#reportingPlot').highcharts({
        chart: {
            type: 'column',
            zoomType: 'xy'
        },
        plotOptions: {

            column: {
                groupPadding: 0,
                events: {
                    legendItemClick: function () {
                            this.remove(true);
                    }
                },
                showInLegend: true
            }
        },
        title: {
            text: ' ',
            x: -20 //center
        },
        labels: {
           items: [{
               html: '',
               style: {
                   left: '10px',
                   top: '10px',
                   fontSize: '20px',
                   color: 'black'
               }
           }]
       },
        credits: {
            enabled: false
        },
        subtitle: {
            text: '',
            x: -20
        },
        xAxis: {
           categories: []
        },
        yAxis: {
            title: {
                text: ''
            },
            plotLines: [{
                value: 0,
                width: 1
            }]
        },
        tooltip: {
            valueSuffix: ''
        },

        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0,
            useHTML:true,
            labelFormatter: function() {
              return   this.name +'' ;
            }
        }
    });
}




function initReportingPlot(){ //

    //Grab the last row and default to this:
    var initData = []
    $.each($('table#reportingTable tr:last '),function(){
        $(this).find('td:gt(0)').each(function(i,v){
              initData.push(parseFloat($(this).text().replace(/,/g,'')));
          });
          seriesName = $(this).find('td:eq(0)').text();
          seriesName = seriesName.trim();

          $('#reportingPlot').highcharts().addSeries({
              name: seriesName,
              data: initData
          });
    });

    //Update the categories:
    catList = [];
    $.each($('#reportingTable > thead > tr > th'),function(idx,val){
        if (idx !=0){
            catList.push($(this).text());
        }
    });
    $('#reportingPlot').highcharts().xAxis[0].setCategories(catList);

    formatTable('reportingTable','');
    updateClickEvents();
    updateReportingPlot();

}

jQuery.fn.filterNumberRange = function(item, low, high){
    return this.filter(function(){
        var value = +$(this).attr("data-price");
        return value >= low && value <= high;
    });
};

function updateClickEvents(){
    //Now we specify the click events and such depending on the report we are looking at:
            $('#reportingTable > tbody > tr >td:first-child').unbind('click');

            if ($('#reportType').val() != 'rate_path'){


                $('#reportingTable > tbody > tr >td:first-child').click(function(e){ //Drill down
                    if(!e.altKey) {
                        rowHandle = $(this).parent('tr'); //What we clicked:
                        rowStatus = rowHandle.attr('isActive');
                        if (rowStatus == 'true'){
                            var startIndex = rowHandle.index();
                            tmpLvl = rowHandle.attr('level');

                            //tmpEle = rowHandle.filter(function() {
                            //    return  $(this).attr("level") >= tmpLvl;
                            //});

                            //var endIdx = rowHandle.filterNumberRange("level", tmpLvl, 20000).index();
                            //console.log(endIdx);


                            var endIdx = rowHandle.nextAll('tr[level='+tmpLvl+']:first').index();

                            //Find all elements larger than the parent and remove
                            //$('#reportingTable > tbody > tr').filterNumberRange("level", tmpLvl+1, 20000).remove();
                            //console.log($('#reportingTable > tbody > tr'));
                            //console.log(startIndex + " " + endIdx);
                            $('#reportingTable > tbody > tr').slice(startIndex+1,endIdx).remove();
                            //$('#reportingTable > tbody > tr:eq('+(endIdx-1)+')').css('border-bottom','');
                            rowHandle.attr('isActive','false');
                            rowHandle.removeClass('activeCell')
                        }else{
                            rowHandle.addClass('activeCell')
                            rowHandle.attr('isActive','true');

                            //Call the ajax to drill down the values:
                            var data = new FormData();
                            data.append('baseScen',$('#baseScen').val()); // Get the base scenario
                            data.append('compScen',$('#compScen').val()); // Get the comparison scenario



                            //Update the report step:
                            report_step = -1;
                            if($('select#reportStep').is(':visible')){
                              //If it is visible grab and populate the step:
                              report_step = $('select#reportStep').val();
                            }
                            data.append('reportStep',report_step); // Pass the step
                            rptString =  $('#reportType').val();
                            data.append( 'reportType',rptString); // Add the report type to be sent
                            data.append( 'parentName', $(this).attr('name'));
                            levelCount = $(this).children('i').length;
                            data.append( 'parentLvl', levelCount+1);
                            childLvl = parseInt(rowHandle.attr('level'))+1;
                            console.log('reportType: ' + $('#reportType').val());
                            console.log('parentName: ' + $(this).attr('name'));
                            console.log('parentLvl: ' + (levelCount+1));

                            $.ajax({
                                url: ajax_base_str+'drillDown/',
                                type: 'POST',
                                data:data,
                                cache: false,
                                contentType: false,
                                processData: false,
                                success: function(result) {
                                    console.log(result);
                                    //take the results, ignore the first row, and append indexing:
                                    bodyString = '';

                                    $.each(result['drillDownData'],function(idx,val){
                                        if (idx!=0){ //Ignore the headers:
                                            bodyString = bodyString  + '<tr level="'+childLvl+'" isActive="false" >';
                                            $.each(val,function(idxBody,valBody){
                                                if(idxBody==0){ //Append the number of levels:
                                                    bodyString = bodyString + '<td name="' + valBody + '" class="reportCell" style="font-size:'+(16-childLvl)+'px;padding-left:'+(5*childLvl)+'px">' + '<i class="fa fa-chevron-right"></i> '.repeat(levelCount+1) + valBody + '</td>'
                                                }else{
                                                    bodyString = bodyString + '<td name="' + valBody + '" style="font-size:'+(16-childLvl)+'px;">' + valBody + '</td>'
                                                }
                                            });
                                            bodyString = bodyString  + '</tr>';
                                        }
                                    });

                                    rowHandle.after(bodyString);

                                    var startIndex = rowHandle.index();
                                    tmpLvl = rowHandle.attr('level');
                                    var endIdx = rowHandle.nextAll('tr[level='+tmpLvl+']:first').index();

                                    updateClickEvents();
                                    formatTable('reportingTable','');
                                    updateReportingPlot();
                                },
                                error: function(result){

                                }
                            });

                        }

                    }

                });
            }
}










function updateReportingPlot(){


   //Update the chart labels and looks depending on the metric requested:====================================
   //Get the report type:
   $('#reportingPlot').highcharts().options.labels.items[0].html= "";
   $('#reportingPlot').highcharts().render();

    if ($('#reportType').val() == 'ntl_repr'){
        $('#reportingPlot').highcharts().yAxis[0].setTitle({ text: "Notional" });
        $('#reportingPlot').highcharts().series[0].update({
            type: 'column',
            zoomType: 'xy'
        });
    }else if ($('#reportType').val() == 'ntl_sched'){
        $('#reportingPlot').highcharts().yAxis[0].setTitle({ text: "Notional" });
        $('#reportingPlot').highcharts().series[0].update({
            type: 'column',
            zoomType: 'xy'
        });
    }else if ($('#reportType').val() == 'ntl_gapd'){
        $('#reportingPlot').highcharts().yAxis[0].setTitle({ text: "Notional" });
        $('#reportingPlot').highcharts().series[0].update({
            type: 'column',
            zoomType: 'xy'
        });
    }else if ($('#reportType').val() == 'pv_t'){
        $('#reportingPlot').highcharts().yAxis[0].setTitle({ text: "Present Value" });
        $('#reportingPlot').highcharts().series[0].update({
            type: 'line',
            zoomType: 'xy'
        });
    }else if ($('#reportType').val() == 'ai_t'){
        $('#reportingPlot').highcharts().yAxis[0].setTitle({ text: "Annual Income" });
        $('#reportingPlot').highcharts().series[0].update({
            type: 'line',
            zoomType: 'xy'
        });
    }else if ($('#reportType').val() == 'dur_t'){
        $('#reportingPlot').highcharts().yAxis[0].setTitle({ text: "Duration" });
        $('#reportingPlot').highcharts().series[0].update({
            type: 'line',
            zoomType: 'xy'
        });
    }else if ($('#reportType').val() == 'nii_t'){
        $('#reportingPlot').highcharts().yAxis[0].setTitle({ text: "NII" });
        $('#reportingPlot').highcharts().series[0].update({
            type: 'line',
            zoomType: 'xy'
        });
        // Calculate the total NII for the output:
        total_nii = 0 ;
        $.each($('#reportingTable tbody tr:eq(4) td:gt(0)'),function(key,val){
          console.log($(this).text())
          total_nii = total_nii + parseFloat($(this).text().replace(/,/g , ""));
        });

         $('#reportingPlot').highcharts().options.labels.items[0].html= "Total NII: " + numberWithCommas(total_nii);
         $('#reportingPlot').highcharts().render();


    }else if ($('#reportType').val() == 'dv01_t'){
        $('#reportingPlot').highcharts().yAxis[0].setTitle({ text: "DV01" });
        $('#reportingPlot').highcharts().series[0].update({
            type: 'column'
        });
    }else if ($('#reportType').val() == 'rate_path'){
        $('#reportingPlot').highcharts().yAxis[0].setTitle({ text: "Rate" });
        $('#reportingPlot').highcharts().series[0].update({
            type: 'line'
        });
    }else if ($('#reportType').val() == 'coup_repr'){
        $('#reportingPlot').highcharts().yAxis[0].setTitle({ text: "Coupon" });
        $('#reportingPlot').highcharts().series[0].update({
            type: 'column'
        });
    }else if ($('#reportType').val() == 'coup_sched'){
        $('#reportingPlot').highcharts().yAxis[0].setTitle({ text: "Coupon" });
        $('#reportingPlot').highcharts().series[0].update({
            type: 'column'
        });
    }else if ($('#reportType').val() == 'coup_gapd'){
        $('#reportingPlot').highcharts().yAxis[0].setTitle({ text: "Coupon" });
        $('#reportingPlot').highcharts().series[0].update({
            type: 'column'
        });
    }else if ($('#reportType').val() == 'market_rates'){
        $('#reportingPlot').highcharts().yAxis[0].setTitle({ text: "Market Rates" });
        $('#reportingPlot').highcharts().series[0].update({
            type: 'column'
        });
    }else if ($('#reportType').val() == 'dv01_timeseries'){
        $('#reportingPlot').highcharts().yAxis[0].setTitle({ text: "Parallel DV01" });
        $('#reportingPlot').highcharts().series[0].update({
            type: 'line'
        });
    }






    $('table#reportingTable tr').unbind( "click" );
    $('table#reportingTable tr').click(function(e) { //On alt-click on table rows
      if(e.altKey) {
        $("html, body").animate({ scrollTop: 0 }, "slow");
            //while( $('#reportingPlot').highcharts().series.length > 0){ //Delete all current plots
            //   $('#reportingPlot').highcharts().series[0].remove(true);
            //}



          //Let us now grab the data
        var rowData = []
        $(this).find('td:gt(0)').each(function(i,v){
            rowData.push(parseFloat($(this).text().replace(/,/g,'')));
        });
        seriesName = $(this).find('td:eq(0)').text();
        seriesName = seriesName.trim();

        if ($.inArray($('#reportType').val() , ['ntl_repr','ntl_sched','ntl_gapd','coup_repr','coup_sched','coup_gapd','dv01_t','market_rates'] )!=-1){
            $('#reportingPlot').highcharts().addSeries({
                name: seriesName,
                data: rowData
            });
        }else{
            $('#reportingPlot').highcharts().addSeries({
                name: seriesName,
                data: rowData,
                type: 'line'
            });
        }





      }
    });



  }








function updateReportingOptions(){
    //Update the list of reportable objects:
    //Get list of finished scenarios:
    standardScenList = ['NULL'];
    $.each($('#standardScenarioTable tr').find('td:nth-child(1)'),function(){
        standardScenList.push($(this).text())
    });
    $.each($('#customScenarioTable tr').find('td:nth-child(4)'),function(){
       if ($(this).parent().find('td:nth-child(4) > span').hasClass('label-success')){
           standardScenList.push($(this).parent('tr').find('td:nth-child(3)').text())
       }
    });

    $('select#reportStep').html("<option value='0'>0</option>");

    //Let's populate the number of steps:
    $('#baseScen').change(function(){
      //Find the number of steps for the base and comp scens:
      baseScen_name = $('#baseScen').val();
      compScen_name = $('#compScen').val();
      num_comp_steps = scenarioList[compScen_name]['evolutionObj']['num_steps'];
      if(baseScen_name=='NULL'){
        num_base_steps = 1000
      }else{
        num_base_steps = scenarioList[baseScen_name]['evolutionObj']['num_steps'];
      }
      //find the min:
      min_steps = Math.min(parseInt(num_base_steps),parseInt(num_comp_steps));
      if(typeof min_steps == 'undefined'){
          min_steps = 0;
      }
      $('select#reportStep').html('');
      for (var i = 0; i < min_steps+1; i++) {
          $('select#reportStep').append("<option value='"+i+"'>"+i+"</option>");
      }
    });
    $('#compScen').change(function(){
      //Find the number of steps for the base and comp scens:
      baseScen_name = $('#baseScen').val();
      compScen_name = $('#compScen').val();
      num_comp_steps = scenarioList[compScen_name]['evolutionObj']['num_steps'];

      if(baseScen_name=='NULL'){
        num_base_steps=1000;
      }else{
        num_base_steps = scenarioList[baseScen_name]['evolutionObj']['num_steps'];
      }

      //find the min:
      min_steps = Math.min(parseInt(num_base_steps),parseInt(num_comp_steps));
      if(typeof min_steps == 'undefined'){
          min_steps = 0;
      }
      $('select#reportStep').html('');
      for (var i = 0; i < min_steps+1; i++) {
          $('select#reportStep').append("<option value='"+i+"'>"+i+"</option>");
      }
    });



    $('#baseScen').html('');
    for (var i = 0; i < standardScenList.length; i++) {
        $('#baseScen').append("<option value='"+standardScenList[i]+"'>"+standardScenList[i]+"</option>");
    }


    $('#compScen').html('');
    for (var i = 1; i < standardScenList.length; i++) {
        $('#compScen').append("<option value='"+standardScenList[i]+"'>"+standardScenList[i]+"</option>");
    }

    //reportList = ['Repricing Gap','Maturity Gap','PV','AI','Duration','NII','DV01']
    reportList_text = ['Repricing Gap','Repricing Coupon','Maturity Gap','Maturity Coupon','Production Gap','Production Coupon','PV','Duration','NII','DV01','Rate Path','Market Curve','Parallel DV01 TS']
    reportList_vals = ['ntl_repr','coup_repr','ntl_sched','coup_sched','ntl_gapd','coup_gapd','pv_t','dur_t','nii_t','dv01_t','rate_path','market_rates','dv01_timeseries']
    $('#reportType').html('');
    for (var i = 0; i < reportList_text.length; i++) {
        $('#reportType').append("<option value='"+reportList_vals[i]+"'>"+reportList_text[i]+"</option>");
    }


    $('select#rateName').html('');
    for (var i = 2; i < market_rate_list.length; i++) {
        $('select#rateName').append("<option value='"+market_rate_list[i]+"'>"+market_rate_list[i]+"</option>");
    }

   //Add a change function so that we grab the other related information:
   $('#reportType').change(function(){
       //Do an ajax request to get the step number and date
        if ($.inArray($('#reportType').val(),['ntl_repr','ntl_sched','ntl_gapd','coup_repr','coup_sched','coup_gapd','dv01_t','market_rates']) !=-1){
            //Let's unhide the frame and fill it with the proper data:
            $('p#reportStep').slideDown(300);$('select#reportStep').slideDown(300);
            $('p#rateName').slideUp(300);$('select#rateName').slideUp(300);
        }else if($.inArray($('#reportType').val(),['rate_path']) !=-1){
            $('p#rateName').slideDown(300);$('select#rateName').slideDown(300);
            $('p#reportStep').slideUp(300);$('select#reportStep').slideUp(300);
        }else{
            $('p#reportStep').slideUp(300);$('select#reportStep').slideUp(300);
            $('p#rateName').slideUp(300);$('select#rateName').slideUp(300);
        }
   });
    $('#reportType').trigger('change');

}

function formatTable(tblID,rowLogic){

    $.each($('#' + tblID + ' > tbody > tr'+rowLogic),function(){
        $.each($(this).find('td:gt(0)'),function(){
            //Take the original text:
            origTxt = $(this).text();
            //Remove commas
            origTxt = origTxt.replace(/,/g , "");
            if (parseFloat(origTxt) < 100 && parseFloat(origTxt) > -100){
                $(this).text(addCommas((parseFloat(origTxt).toFixed(4)).toString()));
            }else{
                $(this).text(addCommas((parseInt(origTxt).toFixed(0)).toString()));
            }
        });
    });



}



function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}
