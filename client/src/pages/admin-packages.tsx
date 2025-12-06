import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Home, Users } from "lucide-react";
import { usePackages } from "@/hooks/use-packages";
import { useDeletePackage } from "@/hooks/use-package-admin";
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
import { AdminAddPackage } from "@/components/admin/admin-add-package";

type AdminPackagesView = "dashboard" | "add" | "edit";

export default function AdminPackagesPage() {
  const [, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState<AdminPackagesView>("dashboard");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data: packages, isLoading } = usePackages();
  const deletePackage = useDeletePackage();

  const handleDeleteClick = (pkg: { id: string; name: string }) => {
    setPackageToDelete(pkg);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!packageToDelete) return;

    try {
      await deletePackage.mutateAsync(packageToDelete);
      toast({
        title: "Package Deleted",
        description: `${packageToDelete.name} has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setPackageToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete package.",
        variant: "destructive",
      });
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  if (currentView === "add") {
    return <AdminAddPackage onBack={handleBackToDashboard} />;
  }

  const formatPrice = (min: number, max: number) => {
    if (min === 0 && max === 0) return "Not Disclosed";
    if (min === max) return `₹${min.toLocaleString()}`;
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navbar */}
      <nav className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="font-serif text-xl font-bold text-primary">Admin Panel - Packages</h1>
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
                  Add Package
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/admin")}
                >
                  Manage Mahals
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
              <h2 className="text-2xl font-bold text-foreground mb-2">Package Management</h2>
              <p className="text-muted-foreground">Manage all wedding packages</p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading packages...</p>
              </div>
            ) : !packages || packages.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No packages found.</p>
                  <Button onClick={() => setCurrentView("add")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Package
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <Card key={pkg.id} className="bg-card border border-card-border">
                    <CardHeader>
                      {pkg.image && (
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <p>
                          <span className="font-medium text-foreground">Price Range:</span>{" "}
                          {formatPrice(pkg.priceRange.min, pkg.priceRange.max)}
                        </p>
                        {pkg.realPrice && pkg.offerPrice && (
                          <>
                            <p>
                              <span className="font-medium text-foreground">Real Price:</span>{" "}
                              ₹{pkg.realPrice.toLocaleString()}
                            </p>
                            <p>
                              <span className="font-medium text-foreground">Offer Price:</span>{" "}
                              ₹{pkg.offerPrice.toLocaleString()}
                            </p>
                          </>
                        )}
                        {pkg.category && (
                          <p>
                            <span className="font-medium text-foreground">Category:</span> {pkg.category}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">
                            Selected by {pkg.selectedBy?.length || 0} user(s)
                          </span>
                        </div>
                        {pkg.selectedBy && pkg.selectedBy.length > 0 && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            <p className="font-medium mb-1">User IDs:</p>
                            <div className="max-h-20 overflow-y-auto">
                              {pkg.selectedBy.map((userId, idx) => (
                                <p key={idx} className="text-muted-foreground truncate">
                                  {userId}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            // TODO: Implement edit functionality
                            toast({
                              title: "Edit Feature",
                              description: "Edit functionality coming soon",
                            });
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDeleteClick({ id: pkg.id, name: pkg.name })}
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
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{packageToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePackage.isPending}
            >
              {deletePackage.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


