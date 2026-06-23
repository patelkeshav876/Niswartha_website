import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Badge } from '../../components/ui/badge';
import { Search, Trash2, Shield, User, Mail, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { useUser } from '../../context/UserContext';
import { toast } from 'sonner';

export function ManageUsers() {
  const { currentUser } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load registered users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    if (deleteId === currentUser?.id) {
      toast.error('You cannot delete your own admin account');
      setDeleteId(null);
      return;
    }
    try {
      await api.deleteUser(deleteId);
      toast.success('User account deleted');
      setDeleteId(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">User Management</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Directory of all registered donors, volunteers, and platform administrators</p>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 rounded-xl border-zinc-200"
        />
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-white border border-zinc-100 rounded-3xl">
          <p className="text-sm">No users found.</p>
        </div>
      ) : (
        <Card className="border border-zinc-200/50 rounded-3xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F2EB] text-zinc-700 font-bold border-b">
                <tr>
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || `https://i.pravatar.cc/150?u=${u.id}`}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover border border-zinc-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 truncate leading-snug">{u.name}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                            <Mail className="h-3 w-3 shrink-0" />
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`font-bold border-none uppercase text-[8px] px-2.5 py-0.5 ${
                        u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {u.role === 'admin' ? 'Administrator' : 'Donor'}
                      </Badge>
                    </td>
                    <td className="p-4 text-zinc-500 font-medium text-xs">
                      {u.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          {u.location}
                        </span>
                      ) : 'Not specified'}
                    </td>
                    <td className="p-4 text-right">
                      {u.id !== currentUser?.id ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(u.id)}
                          className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground font-semibold italic pr-3">Current Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl bg-white border-none p-6 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this user's account? All their donation and booking history records will remain, but they will no longer be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-full bg-red-600 text-white hover:bg-red-700">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
