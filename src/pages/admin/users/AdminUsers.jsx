import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/authContext.jsx';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash2, Ban, UserCheck } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!session) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-all-users');
        if (error) throw error;
        setUsers(data.users);
      } catch (error) {
        toast({
          title: "Erro ao buscar usuários",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [session, toast]);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.target);
    const updates = {
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      plan_status: formData.get('plan_status'),
      role: formData.get('role'),
    };

    try {
      const { error } = await supabase.functions.invoke('admin-update-user', {
        body: { userId: editingUser.id, updates }
      });
      if (error) throw error;
      toast({ title: "Sucesso", description: "Usuário atualizado com sucesso." });
      setIsModalOpen(false);
      setEditingUser(null);
      // Refetch users
      const { data, error: fetchError } = await supabase.functions.invoke('get-all-users');
      if (fetchError) throw fetchError;
      setUsers(data.users);
    } catch (error) {
      toast({ title: "Erro", description: `Falha ao atualizar usuário: ${error.message}`, variant: "destructive" });
    }
  };

  const handleBanUser = async (user, ban = true) => {
    const action = ban ? 'banir' : 'desbanir';
    if (!window.confirm(`Tem certeza que deseja ${action} o usuário ${user.email}?`)) return;

    const updates = {
      banned_until: ban ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString() : 'none',
    };

    try {
      const { error } = await supabase.functions.invoke('admin-update-user', {
        body: { userId: user.id, updates }
      });
      if (error) throw error;
      toast({ title: "Sucesso", description: `Usuário ${action === 'banir' ? 'banido' : 'desbanido'} com sucesso.` });
      const { data, error: fetchError } = await supabase.functions.invoke('get-all-users');
      if (fetchError) throw fetchError;
      setUsers(data.users);
    } catch (error) {
      toast({ title: "Erro", description: `Falha ao ${action} usuário: ${error.message}`, variant: "destructive" });
    }
  };

  const getPlanVariant = (plan) => {
    switch (plan) {
      case 'PRO': return 'success';
      case 'PREMIUM': return 'default';
      case 'FREE': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciamento de Usuários</h1>
      <div className="mb-4">
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Último Login</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan="6" className="text-center">Carregando...</TableCell></TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow><TableCell colSpan="6" className="text-center">Nenhum usuário encontrado.</TableCell></TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.user_metadata?.full_name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPlanVariant(user.plan_status)}>{user.plan_status || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.banned_until && new Date(user.banned_until) > new Date() ? 'destructive' : 'success'}>
                      {user.banned_until && new Date(user.banned_until) > new Date() ? 'Banido' : 'Ativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>{user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Nunca'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        {user.banned_until && new Date(user.banned_until) > new Date() ? (
                          <DropdownMenuItem onClick={() => handleBanUser(user, false)}>
                            <UserCheck className="mr-2 h-4 w-4" /> Desbanir
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleBanUser(user, true)} className="text-destructive focus:text-destructive">
                            <Ban className="mr-2 h-4 w-4" /> Banir
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem disabled className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir (em breve)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere as informações do usuário abaixo.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4 py-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input id="full_name" name="full_name" defaultValue={editingUser.user_metadata?.full_name} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editingUser.email} />
              </div>
              <div>
                <Label htmlFor="plan_status">Plano</Label>
                <Select name="plan_status" defaultValue={editingUser.plan_status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="PRO">Pro</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="TRIAL">Trial</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue={editingUser.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;