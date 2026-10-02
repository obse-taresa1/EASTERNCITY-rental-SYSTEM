const { privateDownloadUrl } = require('../config/cloudinary');

function signedPrivateUrl(value) {
  return privateDownloadUrl(value, 300);
}

function withPrivateUserMedia(user) {
  if (!user) return user;
  return {
    ...user,
    nationalIdFrontUrl: signedPrivateUrl(user.nationalIdFrontUrl),
    nationalIdBackUrl: signedPrivateUrl(user.nationalIdBackUrl),
  };
}

function withPrivateListingMedia(listing) {
  if (!listing) return listing;
  return { ...listing, paymentProofUrl: signedPrivateUrl(listing.paymentProofUrl) };
}

function withoutPrivateListingMedia(listing) {
  if (!listing) return listing;
  return { ...listing, paymentProofUrl: null };
}

function withPrivatePromotionMedia(promotion) {
  if (!promotion) return promotion;
  return { ...promotion, paymentProofUrl: signedPrivateUrl(promotion.paymentProofUrl) };
}

function withPrivateAdvertisingMedia(request) {
  if (!request) return request;
  return { ...request, paymentProofUrl: signedPrivateUrl(request.paymentProofUrl) };
}

module.exports = {
  signedPrivateUrl,
  withPrivateAdvertisingMedia,
  withPrivateListingMedia,
  withPrivatePromotionMedia,
  withPrivateUserMedia,
  withoutPrivateListingMedia,
};
