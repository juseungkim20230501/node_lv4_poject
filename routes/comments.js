const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const { Comments } = require('../models');
const { Posts } = require('../models');

// 댓글 작성
router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
  const { userId, nickname } = res.locals.user;
  const { postId } = req.params;
  const { comment } = req.body;
  try {
    if (!postId) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }
    if (!comment) {
      return res.status(412).json({ errorMessage: '댓글을 입력해 주세요.' });
    }
    await Comments.create({
      PostId: postId,
      UserId: userId,
      nickname,
      comment,
    });
    res.status(201).json({ message: '댓글 작성에 성공하였습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '댓글 작성에 실패하였습니다.' });
  }
});

// 댓글 목록 조회
router.get('/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const comments = await Comments.findAll({ where: { postId } });
  const post = await Posts.findOne({ where: { postId } });
  try {
    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }
    const viewComments = comments.map((comment) => {
      return {
        commentId: comment.commentId,
        userId: comment.UserId,
        nickname: comment.Nickname,
        comment: comment.comment,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };
    });
    res.status(200).json({ comments: viewComments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '댓글 조회에 실패하였습니다.' });
  }
});

module.exports = router;
