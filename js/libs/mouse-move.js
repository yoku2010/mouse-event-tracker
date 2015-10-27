'use strict';
/**
 * @description: To Track Mouse Events.
 * @dependency: jquery1.11.x
 * @verion: 0.1.0
 * @date: 23-Oct-2015
 */

(function($) {
	$.fn.extend({
		trackMouseEvents: function(options) {
			var options = $.extend({
				interval: 200
			},options);
			this.each(function() {
				new $.mouseEvents(this, options);
			});
			return this;
		}
	});
	$.mouseEvents = function (me, opt) {
		var tme = {
			obj: {
				$me: $(me),
				$body: $('body')
			},
			vr: {
				mX: 0,
				mY: 0,
				eventName: '',
				mXL: 0,
				mYL: 0,
				eventNameL: '',
				width: 0,
				height: 0,
				offsetX: 0,
				offsetY: 0,
				queue: [],
				isRecording: false,
				errorMarginLeft: -30,
				errorMarginTop: -20,
				recordInterval: null,
				playInterval: null
			},
			func: {
				init: function() {
					tme.func.createActionBar(tme.obj.$body);
					tme.func.createModal(tme.obj.$body);
					tme.func.createCursor(tme.obj.$body);
					tme.evnt.bindWindowEvents();
					tme.func.getContainerSizeOffset();
				},
				createActionBar: function ($body) {
					var $div = $('<div></div>').addClass('action-bar'),
					$container = $('<div></div>').addClass('container'),
					$row = $('<div></div>').addClass('row'),
					$col = $('<div></div>').addClass('col-md-3').addClass('text-right');
					tme.obj.$record = $('<button></button>').text('Record').click(function () {
						tme.evnt.recordEvents(this);
					}).data('event-name', 'record').addClass('btn btn-danger').appendTo($col);
					$col.append(' ');
					tme.obj.$play = $('<button></button>').prop('disabled', true).click(function () {
						tme.evnt.playEvent(this);
					}).text('Play').addClass('btn btn-info disabled').appendTo($col);
					$col.append(' ');
					tme.obj.$list = $('<button></button>').click(function () {
						tme.evnt.viewEventsList(this);
					}).text('View').addClass('btn btn-success').appendTo($col);
					tme.obj.$msg = $('<div></div>').addClass('msg').text('Cilck on "Record" button to record events').appendTo($('<div></div>').addClass('col-md-9')
					.appendTo($row));
					$col.appendTo($row);
					$row.appendTo($container);
					$container.appendTo($div);
					$div.appendTo($body);
				},
				createCursor: function ($body) {
					tme.obj.$cursor = $('<img/>').attr('src', 'img/cursor.png').css({
						'position':'absolute',
						'display':'none'
					}).appendTo($body);
				},
        createModal: function($body) {
          var $modal = $('<div></div>').attr({
            'tabindex': '-1',
            'data-backdrop': 'static',
            'data-keyboard': 'false'
          }).addClass('modal fade'),
					$modalDialog = $('<div></div>').addClass('modal-dialog'),
					$modalContent = $('<div></div>').addClass('modal-content'),
          $modalHeader = $('<div></div>').addClass('modal-header'),
          $modalBody = $('<div></div>').addClass('modal-body'),
          $modalFooter = $('<div></div>').addClass('modal-footer');

          $('<button></button>').attr({
            'type': 'button',
            'data-dismiss': 'modal',
            'aria-hidden': 'true'
          }).addClass('close').text('x').appendTo($modalHeader);

          tme.obj.$modalBox = $('<h4></h4>').addClass('modal-title').text('List of Events').appendTo($modalHeader);

          $('<button></button>').attr({
            type: 'button',
            'data-dismiss':'modal'
          }).click(function(){
            // do nothing
          }).addClass('btn btn-default').text('Cancel').appendTo($modalFooter);
          $('<button></button>').attr({
            type: 'button',
            'data-dismiss':'modal'
          }).click(function(){
            // do nothing
          }).addClass('btn btn-primary').text('Ok').appendTo($modalFooter);
          $modalHeader.appendTo($modalContent);
          $modalBody.appendTo($modalContent);
          $modalFooter.appendTo($modalContent);
					$modalContent.appendTo($modalDialog);
					$modalDialog.appendTo($modal);
          tme.obj.$modalBoxBody = $modalBody;
          tme.obj.$modalBox = $modal;
          $modal.appendTo($body);
        },
				queueMouseEvent: function (force) {
					if (true === force) {
						tme.func.saveMouseEvent();
					}
					else if (tme.vr.mXL !== tme.vr.mX && tme.vr.mYL !== tme.vr.mY) {
						tme.func.saveMouseEvent();
					}
				},
				saveMouseEvent: function () {
					if (tme.vr.isRecording) {
						tme.vr.mXL = tme.vr.mX;
						tme.vr.mYL = tme.vr.mY;
						tme.vr.eventNameL = tme.vr.eventName;
						tme.vr.queue.push([tme.vr.eventName, tme.vr.mX, tme.vr.mY, new Date().getTime(), tme.vr.height, tme.vr.width, tme.vr.offsetLeft, tme.vr.offsetTop]);
					}
				},
				getContainerSizeOffset: function () {
					var offset = tme.obj.$me.offset();
					tme.vr.height = tme.obj.$me.height();
					tme.vr.width = tme.obj.$me.width();
					tme.vr.offsetLeft = offset.left;
					tme.vr.offsetTop = offset.top;
				}
			},
			evnt: {
				recordEvents: function (me) {
					var $me = $(me), action = $me.data('event-name');
					if ('record' === action ) {
						tme.vr.isRecording = true;
						tme.obj.$msg.text('Recording.....');
						$me.text('Stop');
						tme.obj.$play.prop('disabled', true).addClass('disabled');
						$me.data('event-name', 'stop');
						tme.vr.queue.length = 0;
            tme.vr.recordInterval = setInterval(function () {
                tme.func.queueMouseEvent(false);
            }, opt.interval);
					}
					else if ('stop' === action) {
						tme.vr.isRecording = false;
						tme.obj.$msg.text('Recording done, click on "Play" button to play');
						$me.text('Record');
						tme.obj.$play.prop('disabled', false).removeClass('disabled');
						$me.data('event-name', 'record');
						clearInterval(tme.vr.recordInterval);
					}
				},
				playEvent: function (me) {
					var queueLen = tme.vr.queue.length, i = 0;
					tme.obj.$msg.text('Playing...');
					tme.obj.$record.prop('disabled', true).addClass('disabled');
					tme.obj.$cursor.css('display', 'inherit');
					tme.vr.playInterval = setInterval(function () {
							if (i < queueLen) {
									tme.obj.$cursor.css('left', (tme.vr.errorMarginLeft + tme.vr.queue[i][1] + tme.vr.queue[i][6]) + 'px');
									tme.obj.$cursor.css('top', (tme.vr.errorMarginTop + tme.vr.queue[i][2] + tme.vr.queue[i][7]) + 'px');
									i++;
							} else {
								clearInterval(tme.vr.playInterval);
								tme.obj.$cursor.css('display', 'none');
								tme.obj.$msg.text('Start new recording or play previous events');
								tme.obj.$record.prop('disabled', false).removeClass('disabled');
							}
					}, opt.interval);
				},
				viewEventsList: function (me) {
					var $table = $('<table></table>').addClass('table table-hover table-striped'),
					$tr = $('<tr></tr>'), queueLen = tme.vr.queue.length, i = 0;
					$('<th></th>').text('Event').appendTo($tr);
					$('<th></th>').text('Cursor X').appendTo($tr);
					$('<th></th>').text('Cursor Y').appendTo($tr);
					$('<th></th>').text('Timestamp').appendTo($tr);
					$('<th></th>').text('Container Size').appendTo($tr);
					$tr.appendTo($table);

					if (0 === queueLen) {
						$tr = $('<tr></tr>');
						$('<td></td>').attr('colspan', 5).text('No Events!!! Please click on "Record" button to record events.').appendTo($tr);
						$tr.appendTo($table);
					}
					else {
						for (;i<queueLen;i++) {
							$tr = $('<tr></tr>');
							$('<td></td>').text(tme.vr.queue[i][0]).appendTo($tr);
							$('<td></td>').text(tme.vr.queue[i][1]).appendTo($tr);
							$('<td></td>').text(tme.vr.queue[i][2]).appendTo($tr);
							$('<td></td>').text(tme.vr.queue[i][3]).appendTo($tr);
							$('<td></td>').text(tme.vr.queue[i][4] + 'x' + tme.vr.queue[i][5]).appendTo($tr);
							$tr.appendTo($table);
						}
					}
					$table.appendTo(tme.obj.$modalBoxBody.empty());
					tme.obj.$modalBox.modal();
				},
				bindWindowEvents: function() {
					tme.obj.$me.mousedown(function(e) {
						tme.vr.mX = e.pageX - tme.vr.offsetLeft;
						tme.vr.mY = e.pageY - tme.vr.offsetTop;
						tme.vr.eventName = 'Click';
						tme.func.queueMouseEvent(true);
					}).mousemove(function(e){
						tme.vr.mX = e.pageX - tme.vr.offsetLeft;;
						tme.vr.mY = e.pageY - tme.vr.offsetTop;;
						tme.vr.eventName = 'Move';
					}).mouseenter(function(e){
						tme.vr.mX = e.pageX - tme.vr.offsetLeft;;
						tme.vr.mY = e.pageY - tme.vr.offsetTop;
						tme.vr.eventName = 'Enter';	// it has been replaced by move event
						tme.func.queueMouseEvent(true);
					}).mouseleave(function(e) {
						tme.vr.mX = e.pageX - tme.vr.offsetLeft;;
						tme.vr.mY = e.pageY - tme.vr.offsetTop;;
						tme.vr.eventName = 'Leave';
					});
					$( window ).resize(function() {
						tme.func.getContainerSizeOffset();
					});
				}
			}
		};
		// call init function
		tme.func.init();
	}
})(jQuery);
