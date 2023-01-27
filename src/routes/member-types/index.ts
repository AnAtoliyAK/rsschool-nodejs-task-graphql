import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';
import { StatusCodes } from '../../constants/statusCodes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    return fastify.db.memberTypes.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity | null> {

      const memberId = request.params.id

      if (typeof memberId === 'string') {
        const member = await fastify.db.memberTypes.findOne({ key: 'id', equals: request.params.id })
       
        if (!member) {
          reply.statusCode = StatusCodes.NOT_FOUND

          return null
        }

        return member
      } 
      reply.statusCode = StatusCodes.NOT_FOUND

      return null
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity | null> {
      const memberId = request.params.id

      if (typeof memberId === 'string') {
        const member = await fastify.db.memberTypes.findOne({ key: 'id', equals: memberId })
       
        if (!member) {
          reply.statusCode = StatusCodes.BAD_REQUEST

          return null
        }

        return fastify.db.memberTypes.change(memberId, request.body)
      } 

      reply.statusCode = StatusCodes.BAD_REQUEST
      
      return null
    }
  );
};

export default plugin;
