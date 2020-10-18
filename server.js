const express = require("express")
const { graphqlHTTP } = require('express-graphql')

const app = express()
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLInt } = require("graphql")

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const AuthorType = new GraphQLObjectType({
    name: 'author', 
    fields: ()=>({
        id : {type : GraphQLNonNull(GraphQLString)},
        name : {type : GraphQLNonNull(GraphQLString)},
        books : { 
            type: new GraphQLList(BookType), 
            resolve: (author)=>{
                return books.filter(item => item.authorId === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: 'book', 
    fields: ()=>({
        id:  {type: GraphQLNonNull(GraphQLString)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLString)},
        author: {
            type: GraphQLNonNull(AuthorType), 
            resolve: (book)=>{
                return authors.find((a)=> a.id === book.authorId )
            }
        }
    })
})


const rootQueryType = new GraphQLObjectType({
    name: "query",
    description: "Query",
    fields: () => ({
        message : {
            type: GraphQLString,
            resolve: () => " test message"
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of All Books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve: () => authors
        },
        book: {
            type: BookType, 
            args: {
                id: { 
                    type: GraphQLInt
                }
            },
            resolve: (parent, args)=>{
                return books.find((item)=> item.id ===  args.id)
            }
        },
        author : {
            type: AuthorType, 
            args: {
                aId: { 
                    type: GraphQLInt
                }
            },
            resolve: (parent, args )=> authors.find(item => item.id === args.aId)
        }
    })
})

const rootMutationType =  new GraphQLObjectType({
    name: 'mutation', 
    fields: ()=>({
        addAuthor : {
            type: AuthorType, 
            args: {
                name: {type: GraphQLNonNull(GraphQLString)}
            }, 
            resolve: (parent, args)=>{
                console.log(parent)
                const newAuthor = {id: authors.length+1, name: args.name}
                authors.push(newAuthor);
                return newAuthor
            }
        }
    })
})
const schema = new GraphQLSchema({
    query: rootQueryType,
    mutation: rootMutationType
});


app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))

app.listen(5000, () => console.log('Server Running'))