"use client";

import { useMemo } from "react";
import { UrqlProvider, ssrExchange, createClient } from "@urql/next";
import { buildSchema } from "graphql";
import { executeExchange } from "@urql/exchange-execute";
import { cacheExchange } from "@urql/exchange-graphcache";

// Create local schema
const schema = buildSchema(`
  type Author {
    id: ID!
    name: String!
    books: [Book]
  }

  type Book {
    id: ID!
    name: String!
  }

  type Query {
    authors: [Author]!
  }

  type Mutation {
    addAuthor(name: String!): Author!
    addAuthorBook(authorId: ID!, bookName: String!): Book!
  }
`);

let authors = [
  { id: "9", name: "Author One", books: [] },
  { id: "99", name: "Author Two", books: [{ id: "21", name: "Book One" }] },
];

// Create root value with resolvers
const rootValue = {
  authors: () => authors,
  addAuthor: (args) => {
    const item = { id: `${authors.length}`, ...args, books: [] };
    authors = [...authors, item];
    console.log({ authors });
    return item;
  },
  addAuthorBook: (args) => {
    const { authorId, bookName } = args;
    const authorItem = authors.find(({ id }) => id === authorId);

    const newBook = { id: `${20 + authorItem.books.length}`, name: bookName };
    const updatedAuthor = {
      ...authorItem,
      books: [...authorItem.books, newBook],
    };

    console.log({ updatedAuthor });
    const updatedAuthors = authors.map((item) =>
      item.id === authorId ? updatedAuthor : item
    );

    authors = updatedAuthors;

    console.log(authors);
    return newBook;
  },
};

export default function Layout({ children }: React.PropsWithChildren) {
  const [client, ssr] = useMemo(() => {
    const ssr = ssrExchange();
    const client = createClient({
      url: "http://localhost:1234/graphql",
      exchanges: [
        cacheExchange({
          updates: {
            Mutation: {
              addAuthor(result, args, cache, info) {
                console.log({ result });
                const key = "Query";
                cache
                  .inspectFields(key)
                  .filter((field) => field.fieldName === "authors")
                  .forEach((field) => {
                    cache.invalidate(key, field.fieldKey);
                  });
              },
              addAuthorBook(result, args, cache, info) {
                console.log({ result });
                cache.invalidate({
                  __typename: "Author",
                  id: args.authorId as string,
                });
              },
            },
          },
        }),
        ssr,
        executeExchange({
          schema,
          rootValue,
        }),
      ],
      suspense: true,
    });

    return [client, ssr];
  }, []);

  return (
    <html lang="en">
      <UrqlProvider client={client} ssr={ssr}>
        <body>{children}</body>
      </UrqlProvider>
    </html>
  );
}
