import { useState } from "react";
import { usePackages } from "@/hooks/use-packages";
import { Loader2, IndianRupee, ShoppingCart, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { doc, setDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface PackagesPageProps {
  userId: string;
}

interface CartItem {
  id: string;
  name: string;
  priceRange: {
    min: number;
    max: number;
  };
  realPrice?: number;
  offerPrice?: number;
  image?: string;
}

export default function PackagesPage({ userId }: PackagesPageProps) {
  const { data: packages, isLoading, error } = usePackages();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();

  const formatPrice = (min: number, max: number) => {
    if (min === 0 && max === 0) return "Not Disclosed";
    if (min === max) return `₹${min.toLocaleString()}`;
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  const handleAddToCart = (pkg: typeof packages[0]) => {
    const isInCart = cart.some((item) => item.id === pkg.id);
    if (isInCart) {
      toast({
        title: "Already in Cart",
        description: "This package is already in your cart.",
        variant: "default",
      });
      return;
    }

    setCart([
      ...cart,
      {
        id: pkg.id,
        name: pkg.name,
        priceRange: pkg.priceRange,
        realPrice: pkg.realPrice,
        offerPrice: pkg.offerPrice,
        image: pkg.image,
      },
    ]);

    toast({
      title: "Added to Cart",
      description: `${pkg.name} has been added to your cart.`,
    });
  };

  const handleRemoveFromCart = (packageId: string) => {
    setCart(cart.filter((item) => item.id !== packageId));
  };

  const handleConfirmSelection = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add packages to your cart first.",
        variant: "destructive",
      });
      return;
    }

    setIsConfirming(true);

    try {
      // Save each package selection for the user
      for (const item of cart) {
        // Save to user's packages collection
        const userPackageRef = doc(db, "users", userId, "packages", item.id);
        await setDoc(userPackageRef, {
          packageId: item.id,
          packageName: item.name,
          selectedAt: new Date().toISOString(),
          priceRange: item.priceRange,
          realPrice: item.realPrice,
          offerPrice: item.offerPrice,
        });

        // Update package's selectedBy array
        const packageRef = doc(db, "packages", item.id);
        await updateDoc(packageRef, {
          selectedBy: arrayUnion(userId),
        });
      }

      toast({
        title: "Packages Selected!",
        description: `Successfully selected ${cart.length} package(s).`,
      });

      setCart([]);
      setShowCart(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm selection.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load packages</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  const totalPriceRange = cart.reduce(
    (acc, item) => ({
      min: acc.min + item.priceRange.min,
      max: acc.max + item.priceRange.max,
    }),
    { min: 0, max: 0 }
  );

  return (
    <div className="py-16 md:py-24 lg:py-32 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Wedding Packages
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the perfect package for your special day
            </p>
          </div>
          <Button
            onClick={() => setShowCart(true)}
            size="lg"
            className="relative"
            disabled={cart.length === 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Cart
            {cart.length > 0 && (
              <span className="ml-2 bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
                {cart.length}
              </span>
            )}
          </Button>
        </div>

        {!packages || packages.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground mb-2">No packages found</p>
              <p className="text-sm text-muted-foreground">
                Check back later for available packages
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {packages.map((pkg) => {
                const isInCart = cart.some((item) => item.id === pkg.id);
                return (
                  <Card
                    key={pkg.id}
                    className="bg-card border border-card-border rounded-xl overflow-hidden hover-elevate transition-all"
                  >
                    {pkg.image && (
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-card-foreground mb-4 line-clamp-2">
                        {pkg.name}
                      </h3>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <IndianRupee className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{formatPrice(pkg.priceRange.min, pkg.priceRange.max)}</span>
                        </div>

                        {pkg.realPrice && pkg.offerPrice && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground line-through">
                              Real Price: ₹{pkg.realPrice.toLocaleString()}
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              Offer Price: ₹{pkg.offerPrice.toLocaleString()}
                            </p>
                          </div>
                        )}

                        {pkg.category && (
                          <p className="text-xs text-muted-foreground">
                            Category: <span className="capitalize">{pkg.category}</span>
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={() => (isInCart ? handleRemoveFromCart(pkg.id) : handleAddToCart(pkg))}
                        className="w-full"
                        variant={isInCart ? "outline" : "default"}
                      >
                        {isInCart ? (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            Remove from Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Price Range Summary at Bottom */}
            {cart.length > 0 && (
              <div className="bg-card border border-card-border rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Price Range</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatPrice(totalPriceRange.min, totalPriceRange.max)}
                    </p>
                  </div>
                  <Button onClick={handleConfirmSelection} size="lg" disabled={isConfirming}>
                    {isConfirming ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Confirm Selection
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Your Cart</DialogTitle>
            <DialogDescription>
              Review your selected packages before confirming
            </DialogDescription>
          </DialogHeader>

          {cart.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        Price Range: {formatPrice(item.priceRange.min, item.priceRange.max)}
                      </p>
                      {item.realPrice && item.offerPrice && (
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground line-through">
                            Real Price: ₹{item.realPrice.toLocaleString()}
                          </p>
                          <p className="text-primary font-semibold">
                            Offer Price: ₹{item.offerPrice.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Price Range:</span>
                  <span className="text-lg font-bold">
                    {formatPrice(totalPriceRange.min, totalPriceRange.max)}
                  </span>
                </div>
                <Button
                  onClick={handleConfirmSelection}
                  className="w-full"
                  size="lg"
                  disabled={isConfirming}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Confirm Selection
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


