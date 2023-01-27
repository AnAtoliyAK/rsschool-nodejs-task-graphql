import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';
import { StatusCodes } from '../../constants/statusCodes';
import uuid = require('uuid');

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return fastify.db.posts.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | null> {
      const postId = request.params.id

      if (typeof postId === 'string' && uuid.validate(postId)) {
        const post = await fastify.db.posts.findOne({ key: 'id', equals: postId })

        if (!post) {
          reply.statusCode = StatusCodes.NOT_FOUND
          return null
        }

        return post
      }

      reply.statusCode = StatusCodes.NOT_FOUND
      return null
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      return fastify.db.posts.create({ ...request.body })
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | null> {
      const postId = request.params.id

      if (typeof postId === 'string' && uuid.validate(postId)) {
        const post = await fastify.db.posts.findOne({ key: 'id', equals: postId })

        if (!post) {
          reply.statusCode = StatusCodes.NOT_FOUND
          return null
        }

        return fastify.db.posts.delete(request.params.id)
      }

      reply.statusCode = StatusCodes.BAD_REQUEST
      return null
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | null> {
      const postId = request.params.id

      if (typeof postId === 'string' && uuid.validate(postId)) {
        const post = await fastify.db.posts.findOne({ key: 'id', equals: postId })

        if (!post) {
          reply.statusCode = StatusCodes.NOT_FOUND
          return null
        }

        return fastify.db.posts.change(postId, request.body)
      }

      reply.statusCode = StatusCodes.BAD_REQUEST
      return null
    }
  );
};

export default plugin;
