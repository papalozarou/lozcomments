// -----------------------------------------------------------------------------
// lozcomments is a simple commenting system for HTML wireframes and design
// mock-ups. It uses Firebase (https://www.firebase.com/) to store data.
//
// ©2014 Loz Gray – Creative Commons Attribution Sharealike 3.0 Unported 
// http://creativecommons.org/licenses/by-sa/3.0/
//
// Dependancies:
//
// jquery 2.x.x
// lozcomments.css
// -----------------------------------------------------------------------------
var lozcomments = (function () {
	// some global variables – you just need to add you're firebase URL (root)
	var firebaseRootURL = "https:your-firebase-url.firebaseio.com",
		firebaseDocumentURL,
		firebase,
		firebaseChild;
	
	var originalWidth = $(window).width(),
		currentWidth,
		breakpointMedium = 640;
	
	var commentableElements;
	
	var commentAnchors,
		commentPanes,
		commentThreads,
		commentFormsSubmit,
		commentFormsCancel;
		
	var anchorSelected = 'lozcomments__anchor--is-selected',
		paneActive = 'lozcomments__wrapper--is-active',
		paneLeft = 'lozcomments__wrapper--is-left',
		paneRight = 'lozcomments__wrapper--is-right';

	// create comment anchors and comment panes
	function createComments() {
		// creates the firebase for this document
		createFirebase();

		// grab each element that has a data-comment attribute		
		commentableElements = $('[data-comments]');

		// create anchors, comment panes for each of the above elements
		for (var i = commentableElements.length - 1; i >= 0; i--) {
			var count = i + 1,
				commentAnchorHTML = createCommentAnchors(count),
				commentPaneHTML = createCommentPanes(count);
				
				$(commentAnchorHTML).add($(commentPaneHTML)).prependTo(commentableElements[i]);
		}

		// grab inserted comment anchors, panes and form submit/cancel
		// buttons
		commentAnchors = $('.lozcomments__anchor a');
		commentPanes = $('.lozcomments__wrapper');
		commentThreads = $('.lozcomments__thread');
		commentFormsSubmit = $('.lozcomments__form__submit');
		commentFormsCancel = $('.lozcomments__form__cancel');
	}

	// generate new firebase data container based on page title attribute
	function createFirebase() {
		// grab page title, replace spaces with '-' and make lowercase then
		// construct a new firebase reference for this document
		var firebaseID = document.title.replace(/\W/g, '-').toLowerCase();
		
		firebaseDocumentURL = firebaseRootURL + firebaseID + '-comments';
	
		firebase = new Firebase(firebaseDocumentURL);
	}
	// generate new firebase child data container for each commentable element
	function createFirebaseChild(element) {
		// uses data-comments value to create URL, adds to end of Firebase URL
		var firebaseDocumentChildID = '/' + element.closest('[data-comments]').data('comments'),
			firebaseDocumentChildURL = firebaseDocumentURL + firebaseDocumentChildID;

		// initialise new firebase child data container
		firebaseChild = new Firebase(firebaseDocumentChildURL);
	}

	// creates comment anchors and comments
	function createCommentAnchors(i) {
		var commentAnchor = '<figure class="lozcomments__anchor lozcomments__anchor-' + i + '">Comment<a href="#lozcomments__comments-' + i + '"></a></figure>';

		return commentAnchor;
	}

	// creates comments divs
	function createCommentPanes(i) {
		var commentFormHTML = createCommentForm(i),
			commentThreadHTML = createCommentThread(i);

		var commentPane = '<div id="lozcomments__comments-' + i + '" class="lozcomments__wrapper"><div class="lozcomments__pane">' + commentThreadHTML + commentFormHTML + '</div></div>';

		return commentPane;
	}

	// generates HTML for the comment form
	function createCommentForm(i) {
		var commentFormAuthor = '<input type="text" placeholder="Name" class="lozcomments__form__author lozcomments__form-' + i + '__author" />',
			commentFormMessage = '<textarea rows="4" placeholder="Comment" class="lozcomments__form__message lozcomments__form-' + i + '__message" />',
			commentFormSubmit = '<input type="submit" class="lozcomments__form__submit lozcomments__form-' + i + '__submit" value="Comment" />',
			commentFormCancel = '<input type="button" class="lozcomments__form__cancel lozcomments__form-' + i + '__cancel" value="Cancel" />',
			commentForm = '<form method="post" class="lozcomments__form lozcomments__form-' + i + '">' + commentFormAuthor + commentFormMessage + commentFormSubmit + commentFormCancel + '</form>';

		return commentForm;
	}

	// generate HTML for the comment thread
	function createCommentThread(i) {
		var commentThread = '<dl class="lozcomments__thread lozcomments__thread-' + i + '"></dl>';

		return commentThread;
	}
	
	// adds --is-left or --is-right class to each wrapper at medium screen sizes
	// and upwards, to avoid the comment pane appearing off screen
	function positionPanes() {
			// grab current width
			currentWidth = $(window).width();
			
			// tests to see if currentWidth is higher than breakpointMedium
			// and if it is add classes to panes
			if (currentWidth >= breakpointMedium) {
				for (var i = commentAnchors.length - 1; i >= 0; i--) {
					// get anchor parent, it's offset and it's neighbouring
					// wrapper/pane
					var anchorParent = $(commentAnchors[i]).parent('.lozcomments__anchor'),
						anchorParentPosition = anchorParent.offset(),
						pane = anchorParent.siblings('.lozcomments__wrapper');
					
					if (anchorParentPosition.left > (breakpointMedium - 274)) {
						pane.addClass(paneLeft).removeClass(paneRight);
					} else {
						pane.addClass(paneRight).removeClass(paneLeft);
					}
				}
			} else {
				commentPanes.removeClass(paneLeft,paneRight);
			}
			
			originalWidth = currentWidth;
	}
	
	// window resize function to position panes
	function windowResize() {
		$(window).resize(function() {
			// test to see if current width is same as origianal width
			// and run positionPanes() if it isn't
			if (originalWidth !== $(window).width()) {
				positionPanes();
			}
		});
	}

	// retrives, formats and inserts the comment data
	function insertComment() {
		firebase.on('child_added', function(threadSnapshot) {
			threadSnapshot.ref().on('child_added', function(commentSnapshot) {
				var comment = commentSnapshot.val(),
					commentThread = '#lozcomments__' + commentSnapshot.ref().parent().name() + ' .lozcomments__thread';
			
				// format the message string with linebreaks, links and @mentions
				var formattedMessage = formatMessageString(comment.message);
		
				$(commentThread).append('<dt class="lozcomment__author">' + comment.author + '</dt>');
				$(commentThread).append('<dd class="lozcomment__message">' + formattedMessage + '</dd>');
				
				scrollToThreadEnd(commentThread);
			});
		});
	}

	// comment anchor click function
	function interactionAnchors() {
		commentAnchors.click(function(e) {
			addRemoveClasses(this);
	
			e.preventDefault();
		});
	}
	
	// sorts out highlight classes for comment anchors and shows/hides panes	
	function addRemoveClasses(newAnchor) {
		// grab the currently selected anchor if there is one
		var selectedAnchor = $('.lozcomments__anchor--is-selected a');

		var newAnchorHash = newAnchor.hash;

		// test to see if there is a current anchor or not
		if (selectedAnchor[0]) {
			// if there is, decide if the clicked anchor is already selected
			// or not
			if ($(newAnchor).parent().hasClass(anchorSelected)) {
				removeAnchorClass();
		
				closePane();
			} else {
				removeAnchorClass();
		
				addAnchorClass(newAnchor);
		
				openPane(newAnchorHash);
				
				scrollToThreadEnd(newAnchorHash + ' .lozcomments__thread');
			}
		} else {
			addAnchorClass(newAnchor);
	
			openPane(newAnchorHash);
			
			scrollToThreadEnd(newAnchorHash + ' .lozcomments__thread');
		}
	}

	// add class to anchor
	function addAnchorClass(anchor) {
		$(anchor).parent().addClass(anchorSelected);
		$(anchor.hash).addClass(paneActive);
	}

	// remove class from anchors
	function removeAnchorClass() {
		commentAnchors.parent().removeClass(anchorSelected);
	}

	// opens the relevant comment pane
	function openPane(anchorHash) {
		closePane();
		$(anchorHash).addClass(paneActive);
	}

	// closes comment panes
	function closePane() {
		commentPanes.removeClass(paneActive);
	}

	// scrolls comment panes to end
	function scrollToThreadEnd(thread) {
		// $(thread).animate({scrollTop:$(thread)[0].scrollHeight},500);
		$(thread).stop(true,true).animate({scrollTop:$(thread).prop('scrollHeight')},500);
	}

	// submits a comment
	function submitComment() {
		commentFormsSubmit.click(function(e) {
			// create new firebase data container for this thread
			createFirebaseChild($(this));
	
			// grab author and message input
			var authorInput = $(this).siblings('.lozcomments__form__author'),
				messageInput = $(this).siblings('.lozcomments__form__message'),
				author = authorInput.val(),
				message = messageInput.val();
	
			// posts comment to database if authorInput and messageInput both
			// contain text, if not call formErrors()
			if (author !== "" && message !== "") {
				authorInput.removeClass('lozcomments__form__author--has-eror');
				messageInput.removeClass('lozcomments__form__message--has-error');
	
				firebaseChild.push({
					author:author,
					message:message
				});
			} else {
				formErrors(author,authorInput,message,messageInput);
			}
			
			// clear message input, but retain name and propogate to all
			// input fields
			$('.lozcomments__form__author').val(author);
			messageInput.val('');
	
			e.preventDefault();
		});
	}

	// checks for errors in the form and adds style accordingly
	function formErrors(author,authorInput,message,messageInput) {
		// checks to see which fields are blank, adds error class
		if (author === "" && message === "") {
			authorInput.addClass('lozcomments__form__author--has-error');
			messageInput.addClass('lozcomments__form__message--has-error');
		} else if (author === "") {
			authorInput.addClass('lozcomments__form__author--has-error');
			messageInput.removeClass('lozcomments__form__message--has-error');
		} else if (message === "") {
			authorInput.removeClass('lozcomments__form__author--has-error');
			messageInput.addClass('lozcomments__form__message--has-error');
		}
	}
	
	// closes pane/removes anchor class when cancel button is clicked
	function cancelComment() {
		commentFormsCancel.click(function(e) {
			removeAnchorClass();
			closePane();
			
			e.preventDefault();
		});
	}
	
	// prevents page scroll when scrolling comment thread
	function preventPageScroll() {
		commentThreads.bind('mousewheel DOMMouseScroll', function(e) {
			var e0 = e.originalEvent,
				delta = e0.wheelDelta || -e0.detail;
				
			this.scrollTop += (delta < 0 ? 1 : -1) * 30;
			
			e.preventDefault();
		});
	}

	// format the comment text adding line breaks, URLs and @mentions
	function formatMessageString(message) {
		// variables that define regexp for link breaks, URLs and @mentions
		var regexpLineBreaks = /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
			regexpURLs = /((www|(https?|ftp|file):\/\/)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
			regexpMentions = /(@([A-Za-z]+[A-Za-z0-9]+))/ig;

		// replace characters using regexp from above – N.B. must be in this 
		// order or things go awry as linebreaks seems to strip other tags
		message = message.replace(regexpLineBreaks,'$1' + '<br />' + '$2');
		message = message.replace(regexpURLs,'<a href="$1" class="lozcomment__message-body__link">$1</a>');
		message = message.replace(regexpMentions,'<mark class="lozcomment__message-body__mention">' + '$1' + '</mark>');

		return message;
	}
	
	function checkSubstring() {
		// get document URL and parse strings from the first '?' character,
		// then split by '&'
		var subStrings = window.location.search.substring(1).split('&');
		
		// check for switch
		if ($.inArray('lozcomments=off',subStrings) > -1) {
			return false;
		} else {
			createComments();
			
			positionPanes();
			
			insertComment();
			
			interactionAnchors();
			
			submitComment();
			cancelComment();
			
			preventPageScroll();
			
			windowResize();
		}
	}
	
	// check substring and create comment anchors and divs	
	return {
		checkSubstring: checkSubstring
	};
})();

// run lozcomments initially
lozcomments.checkSubstring();

