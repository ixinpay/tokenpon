import { Injectable } from '@angular/core';

@Injectable()
export class Globals {
  readonly chainFormName = "mrofTest2";
  readonly chainPageComment = "mrofTestComment2";
  readonly chainPageVote = "mrofTestVote2";
  readonly tokenDeductAmmount_TokenponComment = 5;
  readonly tokenDeductAmmount_TokenponUpVote = 5;
  readonly tokenDeductAmmount_TokenponDownVote = 10;
  readonly TokenponAppId = 1;
  readonly ChainpostAppId = 2;
  readonly action = { comment: "comment", like: "like", dislike: "dislike", post: "post", login: "login" };
  readonly TokenponShareDealSubject = "Your friend has shared a deal with you";
  readonly TokenponShareDealBody = "Your friend has shared the following deal with you<br/>";
  // readonly ChainPageNewCommentMessageToAuthor = "A new comment has been posted for your listing<br/>";
  // readonly ChainPageNewCommentMessageToProvider = "Thank you for your comment on<br/>";
  // readonly ChainPostNewCommentSubject = "New comment posted";
  // readonly ChainPostNewCommentMessageToAuthor = "A new comment has been posted for your post<br/>";
  // readonly ChainPostNewCommentMessageToProvider = "Thank you for your comment on<br/>";
  readonly TokenponDiscount = [10, 99] ;
  readonly TokenponAccountType = ["individual", "merchant"];
  readonly MaxTokenponPurchaseAllowable = 10;
  readonly iXinMobileAppMessage = "Download the iXin mobile app in order to take advantage of this deal.";
  readonly iXinAndroid = "www.google.com";
  readonly iXiniOS = "www.apple.com";
  readonly iXinDealLive = "The required minimum buyers is met. This deal is LIVE.";
  readonly TokenponGroupBuyPrint = "***This is a group buying item, only the number of buyers reaches the minimum required buyers, this deal will happen.";
  readonly TokenponFineprint = "Promotional value expires 30 days after purchase. After the expiration day, refund will be made, there will be 20% refund charge. Limit 1 per visit. Merchant is solely responsible to purchasers for the care and quality of the advertised goods and services.";
}