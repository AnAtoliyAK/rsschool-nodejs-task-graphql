import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import uuid = require('uuid');
import { StatusCodes } from '../../constants/statusCodes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return fastify.db.users.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | null> {
      const userId = request.params.id

      if (uuid.validate(userId)) {
        const user = await fastify.db.users.findOne({ key: 'id', equals: request.params.id })

        if (!user) {
          reply.statusCode = StatusCodes.NOT_FOUND
          return null
        }

        return user
      }

      reply.statusCode = StatusCodes.NOT_FOUND
      return null
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity | null> {
      return fastify.db.users.create({ ...request.body })
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | null> {
      const userId = request.params.id

      if (uuid.validate(userId)) {
        const mainUserS = await fastify.db.users.findMany({ key: 'subscribedToUserIds', equals: [userId] })

        if (mainUserS && mainUserS?.length) {

          mainUserS.forEach(async (userok) => {
            userok.subscribedToUserIds = userok?.subscribedToUserIds.filter((_id) => _id !== request.params.id)

            await fastify.db.users.change(userok.id, userok)
          })
        }

        const posts = await fastify.db.posts.findMany({ key: 'userId', equals: userId })

        if (posts && posts?.length) {

          posts.forEach(async (_post) => {
            await fastify.db.posts.delete(_post.id)
          })
        }

        const profiles = await fastify.db.profiles.findMany({ key: 'userId', equals: userId })

        if (profiles && profiles?.length) {

          profiles.forEach(async (_profile) => {
            await fastify.db.profiles.delete(_profile.id)
          })
        }

        return fastify.db.users.delete(userId)
      }

      reply.statusCode = StatusCodes.BAD_REQUEST
      return null
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | null> {

      const mainUser = await fastify.db.users.findOne({ key: 'id', equals: request.body.userId })

      if (mainUser) {
        mainUser.subscribedToUserIds = [...mainUser?.subscribedToUserIds, request.params.id]

        return fastify.db.users.change(request.body.userId, mainUser)
      }

      reply.statusCode = StatusCodes.BAD_REQUEST
      return null
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | null> {
      const userId = request.body.userId
      const paramsId = request.params.id
      if (uuid.validate(userId) && uuid.validate(paramsId)) {
        const mainUser = await fastify.db.users.findOne({ key: 'id', equals: userId })

        if (mainUser && mainUser?.subscribedToUserIds?.includes(request.params.id)) {
          mainUser.subscribedToUserIds = mainUser?.subscribedToUserIds.filter((_id) => _id !== request.params.id)

          return fastify.db.users.change(request.body.userId, mainUser)
        }

        reply.statusCode = StatusCodes.BAD_REQUEST
        return null
      }

      reply.statusCode = StatusCodes.BAD_REQUEST
      return null
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | null> {
      const userId = request.params.id

      if (uuid.validate(userId)) {
        const user = await fastify.db.users.findOne({ key: 'id', equals: request.params.id })

        if (!user) {
          reply.statusCode = StatusCodes.NOT_FOUND
          return null
        }

        return fastify.db.users.change(userId, request.body)
      }

      reply.statusCode = StatusCodes.BAD_REQUEST
      return null
    }
  );
};

export default plugin;
