import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertMenuItemSchema, MenuItem, Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, PlusCircle, Pizza } from "lucide-react";

// Create form schema from the insert schema
const formSchema = insertMenuItemSchema.extend({
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateEditItem() {
  const { id } = useParams<{ id: string }>();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const isEditMode = !!id;

  // Fetch categories for dropdown
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch menu item data if in edit mode
  const { data: menuItem, isLoading: isLoadingMenuItem } = useQuery<MenuItem>({
    queryKey: [`/api/menu/${id}`],
    enabled: isEditMode,
  });

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      categoryId: 0,
      tags: "",
      available: true,
      featured: false,
    },
  });

  // Update form values when menu item data is loaded
  useEffect(() => {
    if (isEditMode && menuItem) {
      form.reset({
        ...menuItem,
        tags: menuItem.tags ? menuItem.tags.join(", ") : "",
      });
    }
  }, [menuItem, form, isEditMode]);

  // Create menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const processedData = {
        ...data,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
        price: Number(data.price),
        categoryId: Number(data.categoryId),
      };
      const res = await apiRequest("POST", "/api/menu/create", processedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      toast({
        title: "Menu item created",
        description: "The menu item has been successfully created.",
      });
      navigate("/admin/menu");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create menu item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update menu item mutation
  const updateMenuItemMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const processedData = {
        ...data,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
        price: Number(data.price),
        categoryId: Number(data.categoryId),
      };
      const res = await apiRequest("PUT", `/api/menu/update/${id}`, processedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      queryClient.invalidateQueries({ queryKey: [`/api/menu/${id}`] });
      toast({
        title: "Menu item updated",
        description: "The menu item has been successfully updated.",
      });
      navigate("/admin/menu");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update menu item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    if (isEditMode) {
      updateMenuItemMutation.mutate(values);
    } else {
      createMenuItemMutation.mutate(values);
    }
  };

  const isPending = createMenuItemMutation.isPending || updateMenuItemMutation.isPending;
  const isLoading = isLoadingCategories || (isEditMode && isLoadingMenuItem);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/admin/menu")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu Management
          </Button>
          <h1 className="text-3xl font-heading font-bold flex items-center">
            <Pizza className="mr-2 h-7 w-7" />
            {isEditMode ? "Edit Menu Item" : "Create Menu Item"}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? "Edit details of an existing menu item" : "Add a new item to the menu"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit Item" : "New Item"}</CardTitle>
            <CardDescription>
              Fill in the details of the menu item. All fields are required except Tags.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading...</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Pizza name" {...field} disabled={isPending} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              placeholder="0.00" 
                              {...field} 
                              disabled={isPending}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the item..." 
                            className="resize-none" 
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg" 
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter a URL to an image of the menu item.
                        </FormDescription>
                        <FormMessage />
                        {field.value && (
                          <div className="mt-2">
                            <img 
                              src={field.value} 
                              alt="Preview" 
                              className="h-40 object-cover rounded-md" 
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            disabled={isPending}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem 
                                  key={category.id} 
                                  value={category.id.toString()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Veggie, Spicy, Bestseller" 
                              {...field}
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter tags separated by commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="available"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value === true}
                              onCheckedChange={field.onChange}
                              disabled={isPending}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Available</FormLabel>
                            <FormDescription>
                              Item is available for ordering
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value === true}
                              onCheckedChange={field.onChange}
                              disabled={isPending}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured</FormLabel>
                            <FormDescription>
                              Item is highlighted on the home page
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <CardFooter className="px-0 pb-0">
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-red-700"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                          {isEditMode ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          {isEditMode ? "Update Item" : "Create Item"}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
