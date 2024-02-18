"use client";

import { gql, useMutation, useQuery } from "@urql/next";
import Link from "next/link";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <Authors />
    </Suspense>
  );
}

const AuthorQuery = gql`
  query {
    authors {
      id
      name
      __typename
      books {
        id
        name
        __typename
      }
    }
  }
`;

const AddAuthorBook = gql`
  mutation ($authorId: ID!, $bookName: String!) {
    addAuthorBook(authorId: $authorId, bookName: $bookName) {
      id
      name
    }
  }
`;

const AddAuthor = gql`
  mutation ($name: String!) {
    addAuthor(name: $name) {
      id
      name
    }
  }
`;

function Authors() {
  const [result, refetch] = useQuery({ query: AuthorQuery });
  const [_, addAuthorBookMutation] = useMutation(AddAuthorBook);
  const [__, addAuthorMutation] = useMutation(AddAuthor);

  const handleAddBook = async (authorId: number) => {
    const res = await addAuthorBookMutation({
      authorId,
      bookName: `Random book ${Math.ceil(Math.random() * 100)}`,
    });
    console.log({ res });
  };

  return (
    <main>
      <h1>This is First Page</h1>
      <button onClick={() => refetch({ requestPolicy: "network-only" })}>
        Refetch authors
      </button>
      <ul>
        {result.data &&
          result.data.authors.map((author: any) => (
            <li key={author.id}>
              {author.name}{" "}
              <button onClick={() => handleAddBook(author.id)}>Add book</button>
              {author.books.length > 0 && (
                <ul>
                  {author.books.map((book) => (
                    <li key={book.id}>{book.name}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
      </ul>
      <button
        onClick={async () => {
          await addAuthorMutation({
            name: `Random Author ${Math.ceil(Math.random() * 100)}`,
          });
        }}
      >
        Add author
      </button>
      <div>
        <Link href={"/second"}>Go to second page</Link>
      </div>
    </main>
  );
}
