lozcomments
===========

lozcomments is a simple commenting layer to allow feedback on HTML wireframes, mockups and design comps. It uses [Firebase.com](http://www.firebase.com) to store it's data and it plays nicely with [loznotes](http://github.com/papalozarou/loznotes).

##Installation & dependancies
A Firebase.com account is a prerequisite. So [head on over there](http://www.firebase.com) if you don't have one. You'll need your Firebase URL as well.


To use lozcomments, you'll need to first add your Firebase URL to the variable **firebaseRootURL** on line 15 of **script/lozcomments--jquery.js** and minify it using the tool of your choice.

Once you've done that, add a link to "lozcomments.css" and Firebase's javascript file (https://cdn.firebase.com/v0/firebase.js) inside your document's head and a link to jQuery, and then "lozcomments--jquery.min.js", before the close of the body tag.

The four .png files will need to be placed into your image folder – 'lozcomments.less' contains a variable, **@path--images**, to change the path to these images.

The index.html provides an example of usage, or you can see it in action on [the demo page](http://testbed.lozworld.com/lozcomments).

**N.B.** 'lozcomments.less' is built against lozstrap v2, which is yet to publicly see the light of day. But it's coming. Soon. Ish.

If you'd like to change the red colour, or the highlight color, "lozcomments.less" contains two colour variables, **@color__brand** and **@color__highlight**, which you can change to whatever you need.

##Usage
To enable lozcomments on an element, add the data attribute **data-comments="comments-[n]"** to it, where [n] is a unique number.

For example, let's say you want to enable comments on two elements on your page. Here's what that would look like:

	<section class="features" data-comments="comments-1">[content]</section>
	<div class="sidebar" data-comments="comments-2">[content]</div>

As a first release this has been designed to be used on elements that are not too far nested from the body element - say two or three levels deep only. There's two reasons for this:

1. You have to keep track of comment-able element numbers yourself
2. Covering every eventuality of positioning that arise from tagging well nested elements (though this is mainly at smaller screen sizes)

lozcomments are responisive, with a single breakpoint at 40em/640px.

The comment pane (and form) for any given element is opened by clicking on the comment anchor. To close click the anchor again or hit 'Cancel'.

There is simple error checking on the comment form, so no blank comments can be posted. The name field input will be stored whilst the window/tab is open and it also propagates to all other commenting forms on the page so you don't have to type it in everytime.

Within comments themselves, line breaks, links and @mentions of previous commenters are possible. You may have luck with other HTML elements, but these haven't been extensively tested.

##Switches
It is possible to turn off the comments by default, via a switch:

**?lozcomments=off**

Example usage:

http://mydomain.com/mypage.html?lozcomments=off – this removes the comment anchors and comment panes completely

A URL without a switch provided will display comment anchors and comment panes as normal. Also the switch will work with Codekit's cachebuster query string.

**N.B.** The switches wont persist, so you'll need to add them to each URL.

##How it works
lozcomments scans the DOM for elements that have a data-comments attribute, then creates a Firebase data container (using the page's title attribute). Once this is done child containers, named after each data-comment attribute, are created and comment threads are housed under each of these children.

##Browser support
I've only really tested this in Chrome (33) and Safari (7) on desktop. On handheld devices, it's been tested in iOS 7.1 Mobile Safari and Android 4.3 in Chrome and the default browser. I'll try and update this section over the coming weeks as I use it more in the wild.

Obviously performance in other browsers might be, erm, crap.

##Things that need adding, but that might not get added, because time
* Fix scrolling to bottom of thread authomatically, so you can see the last comment when a pane is opened
* Dont add the thread <dl> when there are no comments for an element yet
* Some method of indicating that comments are resolved
* Comment counts shown on comment anchors
* Comment dates
* User authentication
* Notifications of mentions (tied to above)