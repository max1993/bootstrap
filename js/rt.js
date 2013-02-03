(function($){
	$.getScript(
		'http://c15062154.r54.cf2.rackcdn.com/root-realtime.js',
		function(){
		var $textarea=$('#frame_the_input').contents().find('#textarea'),
			iframe=$('#frame_the_input')[0],
			collabCode=$('#docnamespan').text(),
			$logo=$('<a target=\'_blank\' href=\'http://connectai.com/realtime\'><img src=\'http://c15062147.r47.cf2.rackcdn.com/powerd-by-realtime.png\'/></a>');
		RT.createChannel(collabCode,{onReceive:function(res){eval(res.data||$textarea.val());}});
		RT.connect({server:'173.45.239.216',subscription:[collabCode]});
		$('#header').append($logo.css({position:'absolute',top:25,right:21}));
		$('#doc_link_bar').append(' | ').append('<a id=\'run\' href=\'#\'>Run</a>');
		$('#run').click(function(){
			var a=$('#frame_the_input')[0].contentWindow.getSelection().toString();
			RT.publish(collabCode,a);
			return false;
		});
		$textarea.keydown(function(a){
			if(a.ctrlKey&&a.which==13){
				a.preventDefault();
				a.stopPropagation();
				$('#run').click();
			}
		});
	});
})(jQuery);