(function($) {

    $.fn.drlTbl = function() {
        // For the table given we need to take the first column as the depth.
        // Keep this list of depths in the rows:
        var depth_set = [];
        $.each(this.find(), function (i, item) {
          depth_set.push($(item).attr("depth"));
        });
        console.log(depth_set);
        // Now that we have the depth set we can hide anything other than 1

       this.find("tr[depth][depth!='1']").hide();

       // Finally we will bind a click event to show the subrows based on the click
       this.find("tr[depth]").click(function(){

         if ($(this).is(':visible')){

         }else{
           let current_depth = parseInt($(this).attr("depth"));
           $.each($(this).nextUntil("tr[depth='"+current_depth+"']"),function(idx,row){
             if($(row).attr("depth") == current_depth+1){
               $(row).show();
             }
           });
         }



       })

    }

}(jQuery));


// $("#tableId > tbody > tr").each(function(){
//     var name = $(this).find("td:first").text();
//     console.log("Method name: "+name);
// });
