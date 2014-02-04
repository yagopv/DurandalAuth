/// <reference path="../../../Scripts/jquery.pfold.js" />
define(['plugins/router', 'viewmodels/home/registerInterest', 'services/errorhandler'], function (router, registerInterest, errorHandler) {
	var activeScreen = ko.observable();
	function foldInit() {



				
		var opened = false;

		

		$( '#foldrow > div > div.uc-container' ).each( function( i ) {

			var $item = $( this ), direction;

			switch( i ) {
				case 0 : direction = ['right','bottom']; break;
				case 1 : direction = ['left','bottom']; break;
				case 2 : direction = ['right','top']; break;
					//case 3 : direction = ['left','top']; break;
			}
			

			var pfold = $item.pfold( {
				folddirection : direction,
				speed : 300,
				onEndFolding : function() { opened = false; },
			} );

			$item.find( '.unfold' ).on( 'click', function() {

				if( !opened ) {
					opened = true;
					pfold.unfold();
				}


			} ).end().find( '.fold' ).on( 'click', function() {

				pfold.fold();

			} );
		})

	};

	return {
		convertRouteToHash: router.convertRouteToHash,
		activeScreen: activeScreen,
		activate: function () {
			ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
			var reg = registerInterest.create();
			activeScreen(reg);
			
		},
		attached: function () {
			foldInit();
		}
	};

	

});