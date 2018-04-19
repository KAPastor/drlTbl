(function($) {

	$.fn.drlTbl = function(options) {
	  // Define the default options for the plugin:
	  var defaults = {
		prepend: ">",
		fontScaling: 2
	  };
	  var options = $.extend(defaults, options);
	  var max_depth = 0;
	  var that = this;
	  // First thing to do is to prepend at every depth the prepnd option
	  $.each(this.find("tr[depth]"), function (i, item) {
		let prepend_str = Array(parseInt($(item).attr("depth"))).join(options.prepend);
		let cur_size = parseInt($(item).css('font-size'));
		$(item).css('font-size', (cur_size-options.fontScaling*(parseInt($(item).attr("depth"))-1)).toString()+'px')
		// For each depth we will prepend the string onto the first td element of the row.
		$(item).find('td:first').prepend(prepend_str);

		if (max_depth<$(item).attr("depth")){max_depth = $(item).attr("depth")};

	  });


		// Now we do the td element calculations based on the drlcalc attribute
		// This all must be done from a bottom up method.  First we will find the max depth element
		// and its location
		for (d_ind=max_depth-1;d_ind>0;d_ind--){
			$.each(this.find('tr[depth]'), function (i, item) {
				if ($(item).attr("depth")==d_ind){
					$.each($(item).find("td[drlcalc]"), function (j, td_item) {
						// Find the calc method
						var drlcalc_method = $(td_item).attr('drlcalc');
						var col = $(item).children().index($(this));
						let current_depth = parseInt($(this).parent().attr("depth"));
						// Find out the depth of the next row index

						let total_sum = 0;

						console.log('----');
						console.log(d_ind);
						console.log($(item).nextUntil().filter(function(){return $(this).attr('depth') == d_ind+1;}));

						$.each($(item).nextUntil("tr[depth='"+current_depth+"']").filter(function(){return $(this).attr('depth') == d_ind+1;}),function(idx,row){
							total_sum = total_sum + parseFloat($(row).find('td').eq(col).html());
						});
						$(td_item).text(total_sum);
					});
				}



			});

			// // Look for the td drlprepend, drlformat, drlappend stylings
			// $.each($(item).find("td[drlappend]"), function (j, td_item) {
			// 	$(td_item).text($(td_item).text() + $(td_item).attr('drlappend'));
			// });
			// $.each($(item).find("td[drlprepend]"), function (j, td_item) {
			// 	$(td_item).text($(td_item).attr('drlprepend') + $(td_item).text());
			// });

		}



	  // Hide all of the level 1 depths
	  this.find("tr[depth][depth!='1']").hide();

	   // Finally we will bind a click event to show the subrows based on the click
	   this.find("tr[depth] > td:nth-child(1)").click(function(){
		 let that = $(this).parent('tr');
		 let current_depth = parseInt(that.attr("depth"));
		 // Find out the depth of the next row index
		 let next_row_depth = parseInt(that.closest('tr').next('tr').attr("depth"));
		 console.log(current_depth);
		 console.log(next_row_depth);

		 // If the next row is not smaller than the current we know we are at a leaf
		 if (current_depth<next_row_depth){// We are able to drill down more now
		   // Check if the next row is already visible.
		   if (that.closest('tr').next('tr').is(':visible')){ // Already open so close
			 $.each(that.nextUntil("tr[depth='"+current_depth+"']"),function(idx,row){
			   if($(row).attr("depth") > current_depth){
				 $(row).hide();
			   }
			 });
		   }else{ // Not visible so we will open it
			 $.each(that.nextUntil("tr[depth='"+current_depth+"']"),function(idx,row){
			   if($(row).attr("depth") == current_depth+1){
				 $(row).show();
			   }
			 });
		   }
		 }


	   })

	}

}(jQuery));
