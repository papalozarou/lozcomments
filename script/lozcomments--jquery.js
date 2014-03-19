// generate new firebase data container based on page title attribute
var firebaseBaseURL = "https://blinding-fire-4499.firebaseio.com/",
	firebaseNewContainer = document.title.replace(/\W/g, '-').toLowerCase(),
	firebaseURL = firebaseBaseURL + firebaseNewContainer + '-comments';

// initialise new firebase data container
var fb = new Firebase(firebaseURL),
	fbChild;

var commentForm,
	commentFormName,
	commentFormMessage,
	commentFormSubmit;

// grab each element with a data-comment attribute
var commentableElements = $('[data-comments]');


for (var i = commentableElements.length - 1; i >= 0; i--) {
	commentForm = createCommentForm(i + 1);
		
	$(commentableElements[i]).prepend('<div id="lozcomments__comments-' + (i + 1) + '" class="lozcomments__comments lozcomments__comments--is-inactive"><div class="lozcomments__container"><dl class="lozcomments__thread lozcomments__thread-' + (i + 1) +'"></dl>' + commentForm + '</div></div>');
	$(commentableElements[i]).prepend('<figure class="lozcomments__anchor lozcomments__anchor-' + (i + 1) + '">Comment<a href="#lozcomments__comments-' + (i + 1) + '"></a></figure>');
}

function createCommentForm(i) {
	commentFormName = '<input type="text" placeholder="Name" class="lozcomments__form__author lozcomments__form-' + i + '__author" />';
	commentFormMessage = '<textarea rows="4" placeholder="Comment" class="lozcomments__form__message lozcomments__form-' + i + '__message"></textarea>';
	commentFormSubmit = '<input type="submit" class="lozcomments__form__submit lozcomments__form-' + i + '__submit" value="Comment" /><input type="button" class="lozcomments__form__cancel lozcomments__form-' + i + '__cancel" value="Cancel" />';
	commentForm = '<form method="post" class="lozcomments__form lozcomments__form-' + i + '">' + commentFormName + commentFormMessage + commentFormSubmit + '</form>';
	
	return commentForm;
}

commentFormSubmit = $('.lozcomments__form__submit');

commentFormSubmit.click(function(e) {
	// construct unique child data container for each commentable element
	var firebaseChildID = '/' + $(this).closest('[data-comments]').data('comments'),
		firebaseChildURL = firebaseURL + firebaseChildID;
		
	// initialise new firebase child data container
	fbChild = new Firebase(firebaseChildURL);

	var authorInput = $(this).siblings('.lozcomments__form__author'),
		messageInput = $(this).siblings('.lozcomments__form__message');
	
	var author = authorInput.val(),
		message = messageInput.val();
	
		console.log(author, message);
	
	// checks to see if the fields are empty or not
	if (author !== "" && message !== "") {
		authorInput.removeClass('lozcomments__form__author--has-error');
		messageInput.removeClass('lozcomments__form__message--has-error');	
		
		fbChild.push({
			author:author,
			message:message
		});
	} else if (author === "" && message === "") {
		authorInput.addClass('lozcomments__form__author--has-error');
		messageInput.addClass('lozcomments__form__message--has-error');		
	} else if (author === "") {
		authorInput.addClass('lozcomments__form__author--has-error');
		messageInput.removeClass('lozcomments__form__message--has-error');	
	} else if (message === "") {
		messageInput.addClass('lozcomments__form__message--has-error');
		authorInput.removeClass('lozcomments__form__author--has-error');
	}
		
	
	messageInput.val('');
	
	e.preventDefault();
});

fb.on('child_added', function(threadSnapshot) {			
	threadSnapshot.ref().on('child_added', function(commentSnapshot,commentCount) {
		var comment = commentSnapshot.val(),
			commentThread = '#lozcomments__' + commentSnapshot.ref().parent().name() + ' .lozcomments__thread';
			
		var formatedComment = formatCommentString(comment.message);
		
		$(commentThread).append('<dt class="lozcomment__author">' + comment.author + '</dt');
		$(commentThread).append('<dd class="lozcomment__message">' + formatedComment + '</dd>');
		
		// $('<dt />').text(comment.author + ' said').appendTo($(commentThread));
		// $('<dd />').html('"' + formatedComment + '"').appendTo($(commentThread));
	});
});

// format the comment text adding line breaks, URLs and mentions
// riffing on nl2br http://phpjs.org/functions/nl2br/
function formatCommentString(message) {
	var regexpLinebreaks = /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
		regexpURLs = /((www|(https?|ftp|file):\/\/)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
		regexpMentions = /(@([A-Za-z]+[A-Za-z0-9]+))/ig;
	
	message = message.replace(regexpLinebreaks,'$1' + '<br />' + '$2');
	message = message.replace(regexpURLs,'<a href="$1" class="lozcomment__message-body__link">$1</a>');
	message = message.replace(regexpMentions,'<mark class="lozcomment__message-body__mention">' + '$1' + '</mark>');
	
	return message;
}

// grab all anchors, and do show hide
$('.lozcomments__anchor a').click(function(e) {
	$('.lozcomments__anchor').removeClass('lozcomments__anchor--is-selected').filter($(this).parent()).addClass('lozcomments__anchor--is-selected');
	$('.lozcomments__comments').removeClass('lozcomments__comments--is-active').addClass('lozcomments__comments--is-inactive').filter(this.hash).addClass('lozcomments__comments--is-active').removeClass('lozcomments__comments--is-inactive');
	
	e.preventDefault();
});

$('.lozcomments__form__cancel').click(function(e) {
	
	console.log('clicked',$(this).closest('.lozcomments__comments'));
	$(this).closest('.lozcomments__comments').removeClass('lozcomments__comments--is-active').addClass('lozcomments__comments--is-inactive').prev('.lozcomments__anchor').removeClass('lozcomments__anchor--is-selected');
	
	
	e.preventDefault();
});


// this stops the page from scrolling when scrolling the comments feed
$('.lozcomments__thread').bind('mousewheel DOMMouseScroll', function(e) {
	var e0 = e.originalEvent,
		delta = e0.wheelDelta || -e0.detail;
	
	this.scrollTop += (delta < 0 ? 1 : -1) * 30;
	e.preventDefault();
});

// tidy up JS
// scroll thread to last comment on start up
// show hide comments via anchor
// need to write cookie to store username.
// dated comments?
// show number of comments