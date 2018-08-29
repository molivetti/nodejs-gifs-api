// Event delegation for dynamically created elements
// All designated anchor tags in our web app have the class 'ajaxCaller'
$(document.body).on("click", '.ajaxCaller', function(event) { 
	// Prevent page from redirecting
	event.preventDefault();

	$.ajax({
		url: this.href,
		beforeSend: function(){
			// Display loading indicator for user after they click a link and expect gifs are being loaded
			$("#content").load( "loading.html" );
		},
		success: function(result){
			// Replace the loading indicator with our rendered gif content
			setTimeout(function(){
				$("#content").html(result);
			}, 400);
		}
	});

});
