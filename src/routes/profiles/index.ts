import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { StatusCodes } from '../../constants/statusCodes';
import uuid = require('uuid');

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<ProfileEntity[]> {
    return fastify.db.profiles.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | null> {
      const profileId = request.params.id

      if (typeof profileId === 'string' && uuid.validate(profileId)) {
        const profile = await fastify.db.profiles.findOne({ key: 'id', equals: profileId })

        if (!profile) {
          reply.statusCode = StatusCodes.NOT_FOUND
          return null
        }

        return profile
      }
      reply.statusCode = StatusCodes.NOT_FOUND
      return null
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | null> {
      const { userId, memberTypeId } = request.body

      if (uuid.validate(userId) && memberTypeId) {
        const member = await fastify.db.memberTypes.findOne({ key: 'id', equals: memberTypeId })
        const profile = await fastify.db.profiles.findOne({ key: 'userId', equals: userId })

        if (!member || profile?.userId === userId) {
          reply.statusCode = StatusCodes.BAD_REQUEST

          return null
        }

        return fastify.db.profiles.create({ ...request.body })
      } else {
        reply.statusCode = StatusCodes.BAD_REQUEST

        return null
      }
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | null> {
      const profileId = request.params.id

      if (typeof profileId === 'string' && uuid.validate(profileId)) {
        const profile = await fastify.db.profiles.findOne({ key: 'id', equals: profileId })

        if (!profile) {
          reply.statusCode = StatusCodes.NOT_FOUND
          return null
        }

        return fastify.db.profiles.delete(request.params.id)
      }

      reply.statusCode = StatusCodes.BAD_REQUEST
      return null
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | null> {
      const profileId = request.params.id

      if (typeof profileId === 'string' && uuid.validate(profileId)) {
        const profile = await fastify.db.profiles.findOne({ key: 'id', equals: profileId })

        if (!profile) {
          reply.statusCode = StatusCodes.NOT_FOUND
          return null
        }

        return fastify.db.profiles.change(profileId, request.body)
      }

      reply.statusCode = StatusCodes.BAD_REQUEST
      return null
    }
  );
};

export default plugin;
