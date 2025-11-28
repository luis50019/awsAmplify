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
  Card,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App(): JSX.Element {
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    const sub = client.models.Expense.observeQuery().subscribe({
      next: (data: any) => setExpenses([...(data.items as any[])]),
      error: (err: any) => console.error("observeQuery error:", err),
    });

    return () => {
      try {
        sub.unsubscribe();
      } catch {}
    };
  }, []);

  async function createExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const name = String(form.get("name") ?? "");
    const amountRaw = form.get("amount");
    const amount = typeof amountRaw === "string" ? parseFloat(amountRaw) : undefined;

    await client.models.Expense.create({ name, amount });
    event.currentTarget.reset();
  }

  async function deleteExpense(id: string) {
    if (!id) return;
    await client.models.Expense.delete({ id });
  }

  return (
    <Authenticator>
      {({ signOut }: any) => (
        <Flex
          height="100vh"
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            color: "#fff",
          }}
        >

          {/* LOGOUT ARRIBA A LA DERECHA */}
          <Button
            onClick={signOut}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "#F00",
              padding: "0.7rem 1.5rem",
              color: "white",
              borderRadius: "8px",
            }}
          >
            Logout
          </Button>

          {/* CONTENEDOR PRINCIPAL */}
          <Flex
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
            gap="3rem"
            padding="2rem"
          >

            {/* MODAL IZQUIERDO */}
            <Card
              padding="2rem"
              width="350px"
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                border: "1px solid #334155",
              }}
            >
              <Heading level={3} marginBottom="1rem" color="#f1f5f9">
                Nuevo Gasto
              </Heading>

              <View as="form" onSubmit={createExpense}>
                <Flex direction="column" gap="1.2rem">
                  <TextField
                    name="name"
                    placeholder="Nombre del gasto"
                    labelHidden
                    style={{ background: "#0f172a", color: "white" }}
                  />
                  <TextField
                    name="amount"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    labelHidden
                    style={{ background: "#0f172a", color: "white" }}
                  />
                  <Button
                    type="submit"
                    style={{
                      background: "#3b82f6",
                      borderRadius: "8px",
                      padding: "0.8rem",
                    }}
                  >
                    Guardar
                  </Button>
                </Flex>
              </View>
            </Card>

            {/* LISTA DE NOTAS A LA DERECHA */}
            <Flex
              width="50%"
              height="80vh"
              direction="column"
              overflow="auto"
              padding="1rem"
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "12px",
                border: "1px solid #475569",
              }}
            >
              <Heading level={3} style={{color:"white"}} textAlign="center" marginBottom="1rem">
                Gastos Registrados
              </Heading>

              <Flex direction="column" gap="1rem">
                {expenses.map((expense: any) => (
                  <Card
                    key={expense.id}
                    padding="1rem"
                    style={{
                      background: "#334155",
                      borderRadius: "10px",
                      border: "1px solid #475569",
                    }}
                  >
                    <Heading level={4}>{expense.name}</Heading>
                    <Text marginTop="0.3rem">${expense.amount}</Text>

                    <Button
                      variation="destructive"
                      marginTop="0.8rem"
                      onClick={() => deleteExpense(expense.id)}
                      style={{
                        background: "#F00",
                        color: "white",
                        borderRadius: "8px",
                      }}
                    >
                      Eliminar
                    </Button>
                  </Card>
                ))}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      )}
    </Authenticator>
  );
}
