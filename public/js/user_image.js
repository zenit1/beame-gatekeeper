/**
 * Created by zenit1 on 27/12/2016.
 */
"use strict";
var userImg,
    signBox,
    imgBox,
    lblReqImg,
    lblReqImgMsg,
    activeImageData;
function onUserImageReceived(args) {
	if (!args || !args.src) {
		return;
	}
	lblReqImg.style.display  = 'none';
	userImg.src              = args.src;
	activeImageData          = {signedData:args.imageData};
	userImg.style.visibility = 'visible';
	cefManager.changeState(1);

}

function showLoadMessage() {
	signBox.style.display   = 'none';
	imgBox.style.display    = 'block';
	lblReqImg.style.display = 'block';
}

function userImageHandler() {

	userImg      = document.getElementById('img-user-pict');
	signBox      = document.getElementById('pairing-box');
	imgBox       = document.getElementById('user-img-box');
	lblReqImg    = document.getElementById('lbl-req-img');
	lblReqImgMsg = document.getElementById('lbl-req-img-msg');

	window.getNotifManagerInstance().subscribe('SHOW_USER_IMAGE', onUserImageReceived);


	window.getNotifManagerInstance().subscribe('SHOW_USER_IMAGE_LOAD_MSG', showLoadMessage);
}


document.addEventListener("DOMContentLoaded", userImageHandler);