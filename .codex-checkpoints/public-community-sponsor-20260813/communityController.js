const prisma = require('../config/db');

const ALLOWED_CITIES = ['Jigjiga', 'Harar', 'Dire Dawa'];
const ALLOWED_NEIGHBOURHOODS = [
  "Sheikh Nur-Ise (Ise Kela)", "Suuq Madow (Kebele 01)", "Taiwan Sefer", "Garab'ase", "Dullaad", "Gende Biyo", "Hoolada (Kebele 06)",
  "Kezira", "Ashewa", "Megala", "Taiwan Market", "Sabian", "Gende Qorii", "Gende Tesfa",
  "Arategna", "Jugol", "Shenkor", "Kazanchis", "Werwari", "Bate", "Botanic"
];
const POST_TYPES = new Set(['RENTAL_REQUEST', 'COMMUNITY_FEED', 'OWNER_ANNOUNCEMENT', 'DISCUSSION']);
const POST_CATEGORIES = new Set(['LOOKING_FOR_ITEM', 'BUSINESS_ANNOUNCEMENT', 'EMERGENCY_REQUEST']);
const authorSelect = { id: true, name: true, city: true, phone: true, profileImageUrl: true, verificationStatus: true };

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map(String).map((tag) => tag.trim()).filter(Boolean).slice(0, 8);
  return String(tags || '').split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8);
}

function mediaData(files = []) {
  return files.slice(0, 5).map((file) => ({
    type: file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE',
    url: `/uploads/community/${file.filename}`,
  }));
}

async function notify(userId, title, body, type, referenceId) {
  if (!userId) return;
  await prisma.notification.create({ data: { userId, title, body, type, referenceId: String(referenceId), referenceType: 'COMMUNITY_POST' } });
}

function feedInclude(userId) {
  return {
    author: { select: authorSelect },
    media: { orderBy: { createdAt: 'asc' } },
    _count: { select: { likes: true, comments: true, savedPosts: true } },
    ...(userId ? {
      likes: { where: { userId }, select: { id: true } },
      savedPosts: { where: { userId }, select: { id: true } },
    } : {}),
  };
}

function serializePost(post, userId) {
  const { _count, likes = [], savedPosts = [], ...rest } = post;
  return {
    ...rest,
    likeCount: _count?.likes ?? (Array.isArray(likes) ? likes.length : 0),
    commentCount: _count?.comments ?? 0,
    savedCount: _count?.savedPosts ?? rest.savedCount ?? 0,
    userLiked: Boolean(userId && likes.length),
    saved: Boolean(userId && savedPosts.length),
  };
}

exports.createCommunityPost = async (req, res, next) => {
  try {
    const { type, title, description, category, city, neighbourhood, rentalPeriod, budget } = req.body;
    if (!POST_TYPES.has(type) || !POST_CATEGORIES.has(category)) return res.status(400).json({ message: 'Choose a valid post type and category.' });
    if (!title?.trim() || !description?.trim()) return res.status(400).json({ message: 'A title and description are required.' });
    if (!ALLOWED_CITIES.includes(city)) return res.status(400).json({ message: 'Choose a valid city.' });
    if (neighbourhood && !ALLOWED_NEIGHBOURHOODS.includes(neighbourhood)) return res.status(400).json({ message: 'Choose a valid neighbourhood.' });

    const post = await prisma.communityPost.create({
      data: {
        type, category, city, neighbourhood,
        title: title.trim(), description: description.trim(), neighbourhood: neighbourhood?.trim() || null,
        budget: budget === '' || budget == null ? null : Number(budget), tags: normalizeTags(req.body.tags), authorId: req.user.id,
        media: { create: mediaData(req.files) },
      },
      include: feedInclude(req.user.id),
    });
    res.status(201).json({ success: true, post: serializePost(post, req.user.id) });
  } catch (error) { next(error); }
};

exports.getCommunityPosts = async (req, res, next) => {
  try {
    const { city, neighbourhood, type, category, search, authorId, page = 1, limit = 12 } = req.query;
    const take = Math.min(Math.max(Number(limit) || 12, 1), 30);
    const currentPage = Math.max(Number(page) || 1, 1);
    
    let statusFilter = 'APPROVED';
    if (authorId && req.user && authorId === req.user.id) {
      statusFilter = undefined; // allow author to see resolved posts
    }

    const where = {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(authorId ? { authorId: String(authorId) } : {}),
      ...(city ? { city: String(city) } : {}), ...(neighbourhood ? { neighbourhood: String(neighbourhood) } : {}),
      ...(POST_TYPES.has(type) ? { type } : {}), ...(POST_CATEGORIES.has(category) ? { category } : {}),
      ...(search ? { OR: [{ title: { contains: String(search), mode: 'insensitive' } }, { description: { contains: String(search), mode: 'insensitive' } }, { tags: { has: String(search) } }] } : {}),
    };
    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({ where, include: feedInclude(req.user?.id), orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }], skip: (currentPage - 1) * take, take }),
      prisma.communityPost.count({ where }),
    ]);
    res.json({ success: true, posts: posts.map((post) => serializePost(post, req.user?.id)), pagination: { page: currentPage, limit: take, total, pages: Math.ceil(total / take) } });
  } catch (error) { next(error); }
};

exports.getCommunityPostById = async (req, res, next) => {
  try {
    const id = parseId(req.params.id); if (!id) return res.status(400).json({ message: 'Invalid request id.' });
    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: { ...feedInclude(req.user?.id), comments: { include: { author: { select: authorSelect } }, orderBy: { createdAt: 'desc' }, take: 50 }, matches: { include: { listing: { include: { images: { take: 1 }, owner: { select: authorSelect } } } }, take: 4 } },
    });
    if (!post || (post.status !== 'APPROVED' && post.authorId !== req.user?.id)) return res.status(404).json({ message: 'Community request not found.' });
    res.json({ success: true, post: { ...serializePost(post, req.user?.id), comments: post.comments } });
  } catch (error) { next(error); }
};

exports.uploadMedia = async (req, res, next) => {
  try {
    const id = parseId(req.params.id); if (!id) return res.status(400).json({ message: 'Invalid request id.' });
    const post = await prisma.communityPost.findUnique({ where: { id }, select: { authorId: true, _count: { select: { media: true } } } });
    if (!post) return res.status(404).json({ message: 'Community request not found.' });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: 'Only the author can add media.' });
    const files = (req.files || []).slice(0, Math.max(0, 5 - post._count.media));
    if (!files.length) return res.status(400).json({ message: 'Upload up to five images per request.' });
    const media = await prisma.$transaction(files.map((file) => prisma.media.create({ data: { ...mediaData([file])[0], postId: id } })));
    res.status(201).json({ success: true, media });
  } catch (error) { next(error); }
};

exports.incrementViews = async (req, res, next) => { try { const id = parseId(req.params.id); const post = await prisma.communityPost.update({ where: { id }, data: { views: { increment: 1 } } }); res.json({ success: true, views: post.views }); } catch (error) { next(error); } };
exports.incrementShares = async (req, res, next) => { try { const id = parseId(req.params.id); const post = await prisma.communityPost.update({ where: { id }, data: { shares: { increment: 1 } } }); res.json({ success: true, shares: post.shares }); } catch (error) { next(error); } };

exports.resolvePost = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const post = await prisma.communityPost.findUnique({ where: { id }, select: { authorId: true, title: true, status: true } });
    if (!post) return res.status(404).json({ message: 'Community request not found.' });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: 'Only the request author can archive it.' });
    const updated = await prisma.communityPost.update({ where: { id }, data: { status: 'RESOLVED' } });
    res.json({ success: true, post: updated });
  } catch (error) { next(error); }
};

exports.likePost = async (req, res, next) => {
  try { const id = parseId(req.params.id); const post = await prisma.communityPost.findUnique({ where: { id }, select: { authorId: true, title: true } }); if (!post) return res.status(404).json({ message: 'Community request not found.' });
    const existing = await prisma.like.findFirst({ where: { postId: id, userId: req.user.id } }); if (existing) return res.status(409).json({ message: 'You already liked this request.' });
    await prisma.like.create({ data: { postId: id, userId: req.user.id } }); if (post.authorId !== req.user.id) await notify(post.authorId, 'Your request was liked', `Someone liked “${post.title}”.`, 'LIKE', id); res.status(201).json({ success: true });
  } catch (error) { next(error); }
};
exports.unlikePost = async (req, res, next) => { try { const id = parseId(req.params.id); await prisma.like.deleteMany({ where: { postId: id, userId: req.user.id } }); res.json({ success: true }); } catch (error) { next(error); } };

exports.savePost = async (req, res, next) => { try { const id = parseId(req.params.id); const post = await prisma.communityPost.findUnique({ where: { id } }); if (!post) return res.status(404).json({ message: 'Community request not found.' }); await prisma.savedPost.upsert({ where: { userId_postId: { userId: req.user.id, postId: id } }, update: {}, create: { userId: req.user.id, postId: id } }); const savedCount = await prisma.savedPost.count({ where: { postId: id } }); await prisma.communityPost.update({ where: { id }, data: { savedCount } }); res.status(201).json({ success: true, savedCount }); } catch (error) { next(error); } };
exports.unsavePost = async (req, res, next) => { try { const id = parseId(req.params.id); await prisma.savedPost.deleteMany({ where: { postId: id, userId: req.user.id } }); const savedCount = await prisma.savedPost.count({ where: { postId: id } }); await prisma.communityPost.update({ where: { id }, data: { savedCount } }); res.json({ success: true, savedCount }); } catch (error) { next(error); } };
exports.getSavedPosts = async (req, res, next) => { try { const saved = await prisma.savedPost.findMany({ where: { userId: req.user.id }, include: { post: { include: feedInclude(req.user.id) } }, orderBy: { createdAt: 'desc' } }); res.json({ success: true, posts: saved.map(({ post }) => serializePost(post, req.user.id)) }); } catch (error) { next(error); } };

exports.addComment = async (req, res, next) => { try { const id = parseId(req.params.id); const content = String(req.body.content || '').trim(); if (!content) return res.status(400).json({ message: 'A comment cannot be empty.' }); const post = await prisma.communityPost.findUnique({ where: { id }, select: { authorId: true, title: true } }); if (!post) return res.status(404).json({ message: 'Community request not found.' }); const comment = await prisma.comment.create({ data: { postId: id, authorId: req.user.id, content }, include: { author: { select: authorSelect } } }); if (post.authorId !== req.user.id) await notify(post.authorId, 'New comment on your request', `Someone commented on “${post.title}”.`, 'COMMENT', id); res.status(201).json({ success: true, comment }); } catch (error) { next(error); } };
exports.getComments = async (req, res, next) => { try { const id = parseId(req.params.id); const take = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50); const comments = await prisma.comment.findMany({ where: { postId: id }, include: { author: { select: authorSelect } }, orderBy: { createdAt: 'desc' }, take }); res.json({ success: true, comments }); } catch (error) { next(error); } };
exports.deleteComment = async (req, res, next) => { try { const id = parseId(req.params.commentId); const comment = await prisma.comment.findUnique({ where: { id } }); if (!comment) return res.status(404).json({ message: 'Comment not found.' }); if (comment.authorId !== req.user.id) return res.status(403).json({ message: 'You can only remove your own comment.' }); await prisma.comment.delete({ where: { id } }); res.json({ success: true }); } catch (error) { next(error); } };
exports.editComment = async (req, res, next) => { try { const id = parseId(req.params.commentId); const content = String(req.body.content || '').trim(); const comment = await prisma.comment.findUnique({ where: { id } }); if (!comment) return res.status(404).json({ message: 'Comment not found.' }); if (comment.authorId !== req.user.id) return res.status(403).json({ message: 'You can only edit your own comment.' }); const updated = await prisma.comment.update({ where: { id }, data: { content } }); res.json({ success: true, comment: updated }); } catch (error) { next(error); } };
