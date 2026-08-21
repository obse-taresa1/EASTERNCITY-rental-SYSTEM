-- Community requests, media, interactions, saved posts, and community conversations.
CREATE TYPE "PostType" AS ENUM ('RENTAL_REQUEST', 'COMMUNITY_FEED', 'OWNER_ANNOUNCEMENT', 'DISCUSSION');
CREATE TYPE "CommunityCategory" AS ENUM ('LOOKING_FOR_ITEM', 'OFFERING_RENTAL', 'EQUIPMENT_NEEDED', 'EVENT_PLANNING', 'BUSINESS_ANNOUNCEMENT', 'RECOMMENDATION', 'LOST_FOUND', 'EMERGENCY_REQUEST');
CREATE TYPE "PostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RESOLVED', 'EXPIRED');
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'ATTACHMENT');
CREATE TYPE "OwnerReplyType" AS ENUM ('LISTING', 'QUOTE', 'DISCOUNT', 'QUESTION', 'RECOMMENDATION', 'MULTIPLE_LISTINGS');

CREATE TABLE "CommunityPost" (
  "id" SERIAL NOT NULL,
  "type" "PostType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" "CommunityCategory" NOT NULL,
  "city" TEXT NOT NULL,
  "neighbourhood" TEXT NOT NULL,
  "rentalPeriod" TEXT,
  "budget" DOUBLE PRECISION,
  "tags" TEXT[] NOT NULL,
  "status" "PostStatus" NOT NULL DEFAULT 'PENDING',
  "views" INTEGER NOT NULL DEFAULT 0,
  "shares" INTEGER NOT NULL DEFAULT 0,
  "savedCount" INTEGER NOT NULL DEFAULT 0,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "authorId" TEXT NOT NULL,
  CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Media" (
  "id" SERIAL NOT NULL,
  "type" "MediaType" NOT NULL,
  "url" TEXT NOT NULL,
  "thumbnail" TEXT,
  "postId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Comment" (
  "id" SERIAL NOT NULL,
  "content" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "postId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Like" (
  "id" SERIAL NOT NULL,
  "userId" TEXT NOT NULL,
  "postId" INTEGER,
  "commentId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SavedPost" (
  "id" SERIAL NOT NULL,
  "userId" TEXT NOT NULL,
  "postId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SavedPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Match" (
  "id" SERIAL NOT NULL,
  "requestId" INTEGER NOT NULL,
  "listingId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notified" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OwnerReply" (
  "id" SERIAL NOT NULL,
  "requestId" INTEGER NOT NULL,
  "ownerId" TEXT NOT NULL,
  "type" "OwnerReplyType" NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OwnerReply_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SavedPost_userId_postId_key" ON "SavedPost"("userId", "postId");
CREATE INDEX "CommunityPost_authorId_idx" ON "CommunityPost"("authorId");
CREATE INDEX "CommunityPost_status_createdAt_idx" ON "CommunityPost"("status", "createdAt");
CREATE INDEX "Media_postId_idx" ON "Media"("postId");
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");
CREATE INDEX "Like_postId_idx" ON "Like"("postId");
CREATE INDEX "SavedPost_postId_idx" ON "SavedPost"("postId");
CREATE INDEX "Match_requestId_idx" ON "Match"("requestId");

ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Media" ADD CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Like" ADD CONSTRAINT "Like_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SavedPost" ADD CONSTRAINT "SavedPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SavedPost" ADD CONSTRAINT "SavedPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CommunityPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OwnerReply" ADD CONSTRAINT "OwnerReply_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CommunityPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OwnerReply" ADD CONSTRAINT "OwnerReply_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Conversation" ALTER COLUMN "listingId" DROP NOT NULL;
ALTER TABLE "Conversation" ADD COLUMN "communityPostId" INTEGER;
CREATE INDEX "Conversation_communityPostId_idx" ON "Conversation"("communityPostId");
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_communityPostId_fkey" FOREIGN KEY ("communityPostId") REFERENCES "CommunityPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
