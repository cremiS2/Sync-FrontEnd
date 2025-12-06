# Problema: Erro 500 ao Criar Atribuição

## ⚠️ SOLUÇÃO RÁPIDA

Execute o arquivo `fix-atribuicao.sql` no seu banco de dados seguindo os passos comentados.

## Causa do Erro

O erro 500 ocorre porque o backend exige que o **usuário logado tenha um funcionário (Employee) associado** para poder criar uma atribuição.

No código do backend (`AllocatedEmployeeMachineService.java`, linha 38-42):

```java
User userChanged = userService.findByEmail(employeeChanged.getName());

if (userChanged.getEmployee() == null) {
    throw new NaoRegistradoException("Por favor, relacione um employee ao user");
}
```

## Solução

Você precisa associar um Employee ao User logado no banco de dados. Existem 3 formas de fazer isso:

### Opção 1: Via SQL Direto (Mais Rápido)

Execute este SQL no banco de dados para associar um employee existente ao user:

```sql
-- Primeiro, veja os users e employees disponíveis
SELECT user_id, email, username FROM tb_user;
SELECT employee_id, name FROM tb_employee;

-- Depois, associe um employee a um user
UPDATE tb_employee 
SET user_id = [ID_DO_USER] 
WHERE employee_id = [ID_DO_EMPLOYEE];
```

**Exemplo:**
```sql
-- Se o user tem ID 1 e o employee tem ID 5
UPDATE tb_employee 
SET user_id = 1 
WHERE employee_id = 5;
```

### Opção 2: Criar um Endpoint no Backend

Adicione um endpoint no `UserController.java` para associar um employee:

```java
@PutMapping("/{userId}/associate-employee/{employeeId}")
public ResponseEntity<Void> associateEmployee(
    @PathVariable Long userId, 
    @PathVariable Long employeeId
) {
    userService.associateEmployee(userId, employeeId);
    return ResponseEntity.ok().build();
}
```

E no `UserService.java`:

```java
@Transactional
public void associateEmployee(Long userId, Long employeeId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new NaoRegistradoException("Usuário não encontrado"));
    
    Employee employee = employeeRepository.findById(employeeId)
        .orElseThrow(() -> new NaoRegistradoException("Funcionário não encontrado"));
    
    employee.setUser(user);
    employeeRepository.save(employee);
}
```

### Opção 3: Criar Employee Automaticamente ao Criar User

Modifique o serviço de criação de usuário para criar um employee automaticamente:

```java
public Long createUser(UserDTO dto) {
    // ... código existente ...
    User savedUser = userRepository.save(user);
    
    // Criar employee automaticamente
    Employee employee = new Employee();
    employee.setName(dto.username());
    employee.setUser(savedUser);
    employee.setAvailability(true);
    employeeRepository.save(employee);
    
    return savedUser.getId();
}
```

## Verificação

Após associar o employee ao user, você pode verificar se funcionou:

```sql
SELECT 
    u.user_id, 
    u.email, 
    u.username,
    e.employee_id,
    e.name as employee_name
FROM tb_user u
LEFT JOIN tb_employee e ON e.user_id = u.user_id;
```

## Observações Importantes

1. **Cada User pode ter apenas 1 Employee** (relação OneToOne)
2. **O Employee precisa existir antes** de ser associado ao User
3. **Após a associação**, o usuário poderá criar atribuições normalmente
4. **O frontend agora mostra uma mensagem mais clara** quando esse erro ocorre

## Testando

Depois de associar o employee ao user:

1. Faça logout e login novamente
2. Vá para a página de Atribuições
3. Clique em "Nova Atribuição"
4. Selecione um funcionário e uma máquina
5. Clique em "Salvar"

Se tudo estiver correto, a atribuição será criada com sucesso!
