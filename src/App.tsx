// src/App.tsx
import React, { useEffect, useState, type JSX } from "react";
import {
  Authenticator,
  Button,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Grid,
  Divider,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App(): JSX.Element {
  // Usamos any[] para evitar fricciones con los tipos ClientModel generados por Amplify.
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    const sub = client.models.Expense.observeQuery().subscribe({
      next: (data: any) => {
        // cast a any[] — en tiempo de ejecución items contiene los objetos esperados
        setExpenses([...((data.items as any[]) || [])]);
      },
      error: (err: any) => {
        console.error("observeQuery error:", err);
      },
    });

    return () => {
      try {
        sub.unsubscribe();
      } catch {
        // ignore
      }
    };
  }, []);

  // Anotar el tipo del evento
  async function createExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const nameValue = form.get("name");
    const amountValue = form.get("amount");

    const name = typeof nameValue === "string" ? nameValue : String(nameValue ?? "");
    const amount =
      amountValue == null
        ? undefined
        : typeof amountValue === "string"
        ? parseFloat(amountValue)
        : typeof amountValue === "number"
        ? amountValue
        : undefined;

    await client.models.Expense.create({
      name,
      amount,
    });

    event.currentTarget.reset();
  }

  // Recibe id explícito
  async function deleteExpense(id: string) {
    if (!id) return;
    await client.models.Expense.delete({ id });
  }

  return (
    <Authenticator>
      {({ signOut }: any) => (
        <Flex
          className="App"
          justifyContent="center"
          alignItems="center"
          direction="column"
          width="70%"
          margin="0 auto"
        >
          <Heading level={1}>Expense Tracker</Heading>

          <View as="form" margin="3rem 0" onSubmit={createExpense}>
            <Flex direction="column" gap="2rem" padding="2rem">
              <TextField
                name="name"
                placeholder="Expense Name"
                label="Expense Name"
                labelHidden
                variation="quiet"
                required
              />

              <TextField
                name="amount"
                placeholder="Expense Amount"
                label="Expense Amount"
                type="number"
                step="0.01"
                labelHidden
                variation="quiet"
                required
              />

              <Button type="submit" variation="primary">
                Create Expense
              </Button>
            </Flex>
          </View>

          <Divider />

          <Heading level={2}>Expenses</Heading>

          <Grid
            margin="3rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="2rem"
            alignContent="center"
          >
            {expenses.map((expense: any) => (
              <Flex
                key={expense?.id ?? expense?.name}
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap="1rem"
                border="1px solid #ccc"
                padding="2rem"
                borderRadius="10px"
                className="box"
              >
                <Heading level={3}>{expense?.name}</Heading>

                <Text fontStyle="italic">${expense?.amount}</Text>

                <Button
                  variation="destructive"
                  onClick={() => deleteExpense(expense?.id)}
                >
                  Delete Expense
                </Button>
              </Flex>
            ))}
          </Grid>

          <Button onClick={() => signOut()}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}
