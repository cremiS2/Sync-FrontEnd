# 🔧 Como Corrigir o Erro de Atribuição - Passo a Passo

## 📋 Problema
Ao tentar criar uma atribuição, você recebe o erro:
```
Error 500: Por favor, relacione um employee ao user
```

## ✅ Solução em 5 Passos

### Passo 1: Abra seu cliente SQL
- MySQL Workbench
- DBeaver
- phpMyAdmin
- Ou qualquer outro cliente SQL

### Passo 2: Descubra seu USER_ID
Execute este comando para ver qual usuário está logado:

```sql
SELECT user_id, email, username FROM tb_user;
```

**Anote o `user_id` do usuário que você está usando para fazer login.**

Exemplo de resultado:
```
user_id | email              | username
--------|--------------------|---------
1       | admin@sync.com     | Admin
2       | joao@sync.com      | João
```

### Passo 3: Veja os funcionários disponíveis

```sql
SELECT 
    employee_id,
    name,
    user_id,
    CASE 
        WHEN user_id IS NULL THEN 'Disponível'
        ELSE 'Já associado'
    END as status
FROM tb_employee;
```

**Escolha um employee que esteja "Disponível" (user_id = NULL).**

Exemplo de resultado:
```
employee_id | name              | user_id | status
------------|-------------------|---------|-------------
1           | Carlos Silva      | NULL    | Disponível
2           | Maria Santos      | 1       | Já associado
3           | Pedro Oliveira    | NULL    | Disponível
```

### Passo 4: Associe o employee ao user

Substitua `[USER_ID]` e `[EMPLOYEE_ID]` pelos valores corretos:

```sql
UPDATE tb_employee 
SET user_id = [USER_ID] 
WHERE employee_id = [EMPLOYEE_ID];
```

**Exemplo real:**
Se você é o user_id = 2 (João) e quer associar ao employee_id = 1 (Carlos Silva):

```sql
UPDATE tb_employee 
SET user_id = 2 
WHERE employee_id = 1;
```

### Passo 5: Confirme que funcionou

```sql
SELECT 
    u.user_id,
    u.email,
    e.employee_id,
    e.name as employee_name
FROM tb_user u
INNER JOIN tb_employee e ON e.user_id = u.user_id
WHERE u.user_id = [SEU_USER_ID];
```

Se aparecer uma linha com seus dados, está correto! ✅

## 🔄 Finalizando

1. **Faça LOGOUT** do sistema
2. **Faça LOGIN** novamente
3. Vá para **Atribuições**
4. Clique em **Nova Atribuição**
5. Preencha os dados e clique em **Salvar**

Agora deve funcionar! 🎉

---

## 🆘 E se não tiver nenhum employee disponível?

Se todos os employees já estão associados a outros users, você precisa criar um novo:

```sql
INSERT INTO tb_employee (
    name, 
    cpf, 
    email, 
    phone, 
    position, 
    sector_id, 
    availability, 
    user_id
)
VALUES (
    'Seu Nome',           -- Nome do funcionário
    '12345678900',        -- CPF (11 dígitos)
    'seu@email.com',      -- Email
    '11999999999',        -- Telefone
    'Operador',           -- Cargo
    1,                    -- ID do setor (veja na tabela tb_sector)
    true,                 -- Disponível para alocação
    [SEU_USER_ID]         -- Seu user_id
);
```

**Importante:** Ajuste o `sector_id` para um setor que existe no seu banco. Para ver os setores:

```sql
SELECT sector_id, name FROM tb_sector;
```

---

## 📞 Ainda com problemas?

Verifique o console do navegador (F12) e procure por:
```
=== ERRO AO CRIAR ATRIBUIÇÃO ===
```

A mensagem de erro detalhada aparecerá logo abaixo.

---

## 🎯 Resumo Rápido

```sql
-- 1. Ver seu user_id
SELECT user_id, email FROM tb_user;

-- 2. Ver employees disponíveis
SELECT employee_id, name, user_id FROM tb_employee WHERE user_id IS NULL;

-- 3. Associar (substitua os números)
UPDATE tb_employee SET user_id = 2 WHERE employee_id = 1;

-- 4. Confirmar
SELECT u.email, e.name FROM tb_user u 
INNER JOIN tb_employee e ON e.user_id = u.user_id 
WHERE u.user_id = 2;
```

Pronto! 🚀
