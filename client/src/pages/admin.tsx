import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Home } from "lucide-react";
import { useMahals } from "@/hooks/use-mahals";
import { useDeleteMahal } from "@/hooks/use-mahal-admin";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminAddMahal } from "@/components/admin/admin-add-mahal";
import { AdminEditMahal } from "@/components/admin/admin-edit-mahal";

type AdminView = "dashboard" | "add" | "edit" | "delete";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [selectedMahalId, setSelectedMahalId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mahalToDelete, setMahalToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data: mahals, isLoading } = useMahals();
  const deleteMahal = useDeleteMahal();

  const handleDeleteClick = (mahal: { id: string; name: string }) => {
    setMahalToDelete(mahal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!mahalToDelete) return;

    try {
      await deleteMahal.mutateAsync(mahalToDelete);
      toast({
        title: "Mahal Deleted",
        description: `${mahalToDelete.name} has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setMahalToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete mahal.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (mahalId: string) => {
    setSelectedMahalId(mahalId);
    setCurrentView("edit");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedMahalId(null);
  };

  if (currentView === "add") {
    return <AdminAddMahal onBack={handleBackToDashboard} />;
  }

  if (currentView === "edit" && selectedMahalId) {
    return <AdminEditMahal mahalId={selectedMahalId} onBack={handleBackToDashboard} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navbar */}
      <nav className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="font-serif text-xl font-bold text-primary">Admin Panel</h1>
              <div className="flex items-center gap-2">
                <Button
                  variant={currentView === "dashboard" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("dashboard")}
                >
                  Dashboard
                </Button>
                <Button
                  variant={currentView === "add" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("add")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Mahal
                </Button>
                <Button
                  variant={currentView === "edit" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    if (mahals && mahals.length > 0) {
                      handleEditClick(mahals[0].id);
                    } else {
                      toast({
                        title: "No Mahals",
                        description: "No mahals available to edit.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Mahal
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/admin-packages")}
                >
                  Packages
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Site
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Mahal Management</h2>
              <p className="text-muted-foreground">Manage all wedding venues</p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading mahals...</p>
              </div>
            ) : !mahals || mahals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No mahals found.</p>
                  <Button onClick={() => setCurrentView("add")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Mahal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mahals.map((mahal) => (
                  <Card key={mahal.id} className="bg-card border border-card-border">
                    <CardHeader>
                      {mahal.thumbnail && (
                        <img
                          src={mahal.thumbnail}
                          alt={mahal.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <CardTitle className="text-lg">{mahal.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <p><span className="font-medium text-foreground">Rank:</span> #{mahal.arrangementOrder ?? "N/A"}</p>
                        <p><span className="font-medium text-foreground">Location:</span> {mahal.location}</p>
                        <p>
                          <span className="font-medium text-foreground">Capacity:</span>{" "}
                          {typeof mahal.capacity === "number" 
                            ? `${mahal.capacity.toLocaleString()} guests` 
                            : `${mahal.capacity} guests`}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Price:</span>{" "}
                          {mahal.priceRange.min === 0 && mahal.priceRange.max === 0 
                            ? "Not Disclosed"
                            : `₹${mahal.priceRange.min.toLocaleString()} - ₹${mahal.priceRange.max.toLocaleString()}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditClick(mahal.id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDeleteClick({ id: mahal.id, name: mahal.name })}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mahal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{mahalToDelete?.name}"? This will permanently delete
              the mahal from Firestore and all its images from Storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMahal.isPending}
            >
              {deleteMahal.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}





