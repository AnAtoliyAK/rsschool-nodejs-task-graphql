import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLList, GraphQLInt } from 'graphql';

export const UserGraphQLType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
    }),
});

export const ProfileGraphQLType = new GraphQLObjectType({
    name: "Profile",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString) },
        avatar: { type: new GraphQLNonNull(GraphQLString) },
        sex: { type: new GraphQLNonNull(GraphQLString) },
        birthday: { type: new GraphQLNonNull(GraphQLInt) },
        country: { type: new GraphQLNonNull(GraphQLString) },
        street: { type: new GraphQLNonNull(GraphQLString) },
        city: { type: new GraphQLNonNull(GraphQLString) },
        memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) },
    }),
});

export const PostGraphQLType = new GraphQLObjectType({
    name: "Post",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) },
    }),
});

export const MemberGraphQLType = new GraphQLObjectType({
    name: "MemberType",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString) },
        discount: { type: new GraphQLNonNull(GraphQLInt) },
        monthPostsLimit: { type: new GraphQLNonNull(GraphQLInt) },
    }),
});

export const FullUserGraphQLType = new GraphQLObjectType({
    name: "FullUser",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
        posts: { type: new GraphQLList(PostGraphQLType) },
        profiles: { type: new GraphQLList(ProfileGraphQLType) },
        memberTypes: { type: new GraphQLList(MemberGraphQLType) },
        userSubscribedToProfiles: { type: new GraphQLList(ProfileGraphQLType) },
        subscribedToPosts: { type: new GraphQLList(PostGraphQLType) },
        userSubscribedToUsers: { type: new GraphQLList(UserGraphQLType) },
        subscribedToUserUsers: { type: new GraphQLList(UserGraphQLType) },
    }),
});

export const FullUserWithSubscriptionsGraphQLType = new GraphQLObjectType({
    name: "FullUserWithSubscription",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
        posts: { type: new GraphQLList(PostGraphQLType) },
        profiles: { type: new GraphQLList(ProfileGraphQLType) },
        memberTypes: { type: new GraphQLList(MemberGraphQLType) },
        userSubscribedToProfiles: { type: new GraphQLList(ProfileGraphQLType) },
        subscribedToPosts: { type: new GraphQLList(PostGraphQLType) },
        userSubscribedToUsers: { type: new GraphQLList(FullUserGraphQLType) },
        subscribedToUserUsers: { type: new GraphQLList(FullUserGraphQLType) },
    }),
});

