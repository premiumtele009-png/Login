import React, { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../UI/Card";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { toast } from "react-hot-toast";
import { Plus, Trash2, Edit2, Check, X, LayoutDashboard, Clock, Activity } from "lucide-react";

interface DashboardProps {
  user: any;
}

interface DashboardItem {
  id: string;
  userId: string;
  content: string;
  updatedAt: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const path = "dashboard";
    const q = query(collection(db, path), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DashboardItem[];
      
      setItems(newItems.sort((a, b) => {
        const dateA = a.updatedAt?.toDate() || new Date(0);
        const dateB = b.updatedAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const path = "dashboard";
    try {
      await addDoc(collection(db, path), {
        userId: user.uid,
        content: newContent.trim(),
        updatedAt: serverTimestamp(),
      });
      setNewContent("");
      toast.success("Item added to dashboard");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const path = `dashboard/${id}`;
    try {
      await deleteDoc(doc(db, "dashboard", id));
      toast.success("Item deleted");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const startEditing = (item: DashboardItem) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleUpdateItem = async (id: string) => {
    if (!editContent.trim()) return;

    const path = `dashboard/${id}`;
    try {
      await updateDoc(doc(db, "dashboard", id), {
        content: editContent.trim(),
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
      setEditContent("");
      toast.success("Item updated");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center opacity-90">
              <Activity className="w-4 h-4 mr-2" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{items.length}</div>
            <p className="text-blue-100 text-sm mt-1 font-medium">Active dashboard entries</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center text-gray-700">
              <Clock className="w-4 h-4 mr-2 text-green-500" />
              Last Update
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {items.length > 0 && items[0].updatedAt 
                ? items[0].updatedAt.toDate().toLocaleTimeString() 
                : "No data"}
            </div>
            <p className="text-gray-500 text-sm mt-1 font-medium">Most recent activity</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center text-gray-700">
              <LayoutDashboard className="w-4 h-4 mr-2 text-purple-500" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">Active</div>
            <p className="text-gray-500 text-sm mt-1 font-medium">System operational</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle className="text-xl">Add New Item</CardTitle>
          <CardDescription className="font-medium">Create a new entry for your personal dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="flex gap-3">
            <Input
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1"
            />
            <Button type="submit" disabled={!newContent.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-500 font-medium tracking-tight">Loading your dashboard...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <LayoutDashboard className="mx-auto w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-semibold text-lg">Your dashboard is empty</p>
            <p className="text-gray-400 text-sm font-medium">Add your first item above to get started</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 border-gray-100">
              <CardContent className="p-6">
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={cancelEditing}>
                        <X className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleUpdateItem(item.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-800 font-medium leading-relaxed min-h-[3rem]">{item.content}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {item.updatedAt?.toDate().toLocaleDateString()}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button size="sm" variant="ghost" onClick={() => startEditing(item)} className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteItem(item.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
