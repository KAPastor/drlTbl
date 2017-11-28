(function($) {

    $.fn.drlTbl = function(options) {
      // Define the default options for the plugin:
      var defaults = {
        prepend: ">",
        fontScaling: 2,
        startLevel: 3
      };
      var options = $.extend(defaults, options);

      // First thing to do is to prepend at every depth the prepnd option
      $.each(this.find("tr[depth]"), function (i, item) {
        let prepend_str = Array(parseInt($(item).attr("depth"))).join(options.prepend);
        let cur_size = parseInt($(item).css('font-size'));
        $(item).css('font-size', (cur_size-options.fontScaling*(parseInt($(item).attr("depth"))-1)).toString()+'px')
        // For each depth we will prepend the string onto the first td element of the row.
        $(item).find('td:first').prepend(prepend_str);
      });

      // Hide everything less than the specified depth.  first find the max depth
      var maximum = null;
      this.find("tr[depth]").each(function() {
        var value = parseFloat($(this).attr('depth'));
        maximum = (value > maximum) ? value : maximum;
      });
      console.log(maximum);
      for (var i = options.startLevel+1; i <= maximum; i++) {
        this.find("tr[depth][depth='"+i+"']").hide();
      }


       // Finally we will bind a click event to show the subrows based on the click
       this.find("tr[depth]").click(function(){
         let current_depth = parseInt($(this).attr("depth"));
         // Find out the depth of the next row index
         let next_row_depth = parseInt($(this).closest('tr').next('tr').attr("depth"));
         console.log(current_depth);
         console.log(next_row_depth);

         // If the next row is not smaller than the current we know we are at a leaf
         if (current_depth<next_row_depth){// We are able to drill down more now
           // Check if the next row is already visible.
           if ($(this).closest('tr').next('tr').is(':visible')){ // Already open so close
             $.each($(this).nextUntil("tr[depth='"+current_depth+"']"),function(idx,row){
               if($(row).attr("depth") > current_depth){
                 $(row).hide();
               }
             });
           }else{ // Not visible so we will open it
             $.each($(this).nextUntil("tr[depth='"+current_depth+"']"),function(idx,row){
               if($(row).attr("depth") == current_depth+1){
                 $(row).show();
               }
             });
           }
         }


       })

    }

}(jQuery));
