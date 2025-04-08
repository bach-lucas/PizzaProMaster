import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { useQuery } from "@tanstack/react-query";
import {
  PizzaBase,
  PizzaSize,
  PizzaCrust,
  PizzaSauce,
  PizzaTopping,
} from "@shared/schema";
import { Loader2, ChevronLeft, ChevronRight, Check, Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Componente de visualização da pizza
const PizzaPreview = ({
  selectedBase,
  selectedSize,
  selectedCrust,
  selectedSauce,
  selectedToppings,
}: {
  selectedBase: PizzaBase | null;
  selectedSize: PizzaSize | null;
  selectedCrust: PizzaCrust | null;
  selectedSauce: PizzaSauce | null;
  selectedToppings: PizzaTopping[];
}) => {
  // Determina quais imagens mostrar com base nas seleções do usuário
  const baseImage = selectedBase?.imageUrl || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&h=300&q=80";
  const sauceImage = selectedSauce?.imageUrl;
  
  // Calcula a escala da pizza com base no tamanho
  const scale = selectedSize ? selectedSize.multiplier : 1;
  
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-bold text-center mb-4">Visualização da Pizza</h3>
      <div 
        className="relative rounded-full overflow-hidden border-8 border-amber-800 shadow-xl"
        style={{
          width: `${240 * scale}px`,
          height: `${240 * scale}px`,
        }}
      >
        {/* Base da pizza */}
        <div className="absolute inset-0 bg-amber-200">
          <img 
            src={baseImage} 
            alt="Base da pizza" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Molho */}
        {selectedSauce && (
          <div className="absolute inset-0 bg-red-600 opacity-70">
            {sauceImage && (
              <img 
                src={sauceImage} 
                alt={selectedSauce.name} 
                className="w-full h-full object-cover opacity-90"
              />
            )}
          </div>
        )}
        
        {/* Coberturas */}
        {selectedToppings.map((topping, index) => (
          <div 
            key={topping.id} 
            className="absolute inset-0"
            style={{
              zIndex: index + 10
            }}
          >
            {topping.imageUrl ? (
              <img 
                src={topping.imageUrl} 
                alt={topping.name} 
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div 
                className="w-full h-full opacity-60 flex items-center justify-center text-white font-bold"
              >
                {topping.name}
              </div>
            )}
          </div>
        ))}
        
        {/* Bordas */}
        {selectedCrust && selectedCrust.name.includes('Borda Recheada') && (
          <div 
            className="absolute inset-0 border-12 rounded-full"
            style={{
              borderWidth: '20px',
              borderColor: selectedCrust.name.includes('Catupiry') ? '#f0e9c9' : '#f8cb64'
            }}
          />
        )}
      </div>
      
      <div className="mt-4 text-center">
        <div className="font-semibold">{selectedSize?.name || 'Selecione um tamanho'}</div>
        <div className="text-muted-foreground">{selectedCrust?.name || 'Selecione uma borda'}</div>
      </div>
    </div>
  );
};

// Componente para seleção de toppings com controle de quantidade
const ToppingSelector = ({
  topping,
  selected,
  onToggle,
}: {
  topping: PizzaTopping;
  selected: boolean;
  onToggle: () => void;
}) => {
  return (
    <div
      className={`flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer ${
        selected ? "bg-primary/10 border border-primary" : "bg-card border border-border"
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center">
        {selected ? (
          <Check className="h-5 w-5 text-primary mr-2" />
        ) : (
          <Plus className="h-5 w-5 text-muted-foreground mr-2" />
        )}
        <span className="font-medium">{topping.name}</span>
      </div>
      <div className="flex items-center">
        <span className="text-sm font-medium">
          {topping.price > 0 ? formatCurrency(topping.price) : "Grátis"}
        </span>
      </div>
    </div>
  );
};

// Componente principal
export default function PizzaBuilderPage() {
  const [, setLocation] = useLocation();
  const { addItem, openCart } = useCart();
  
  const [currentTab, setCurrentTab] = useState("base");
  const [selectedBase, setSelectedBase] = useState<PizzaBase | null>(null);
  const [selectedSize, setSelectedSize] = useState<PizzaSize | null>(null);
  const [selectedCrust, setSelectedCrust] = useState<PizzaCrust | null>(null);
  const [selectedSauce, setSelectedSauce] = useState<PizzaSauce | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<PizzaTopping[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  
  // Consultas para obter dados do servidor
  const { data: bases, isLoading: basesLoading } = useQuery<PizzaBase[]>({
    queryKey: ["/api/pizza/bases"],
  });
  
  const { data: sizes, isLoading: sizesLoading } = useQuery<PizzaSize[]>({
    queryKey: ["/api/pizza/sizes"],
  });
  
  const { data: crusts, isLoading: crustsLoading } = useQuery<PizzaCrust[]>({
    queryKey: ["/api/pizza/crusts"],
  });
  
  const { data: sauces, isLoading: saucesLoading } = useQuery<PizzaSauce[]>({
    queryKey: ["/api/pizza/sauces"],
  });
  
  const { data: toppingsByCategory, isLoading: toppingsLoading } = useQuery<Record<string, PizzaTopping[]>>({
    queryKey: ["/api/pizza/toppings/categories"],
  });

  // Inicializa valores padrão após carregar dados
  useEffect(() => {
    if (bases && bases.length > 0 && !selectedBase) {
      setSelectedBase(bases[0]);
    }
    if (sizes && sizes.length > 0 && !selectedSize) {
      setSelectedSize(sizes[1]); // médio como padrão
    }
    if (crusts && crusts.length > 0 && !selectedCrust) {
      setSelectedCrust(crusts[0]);
    }
    if (sauces && sauces.length > 0 && !selectedSauce) {
      setSelectedSauce(sauces[0]);
    }
  }, [bases, sizes, crusts, sauces]);
  
  // Navegação entre abas
  const goToNextTab = () => {
    if (currentTab === "base") setCurrentTab("size");
    else if (currentTab === "size") setCurrentTab("crust");
    else if (currentTab === "crust") setCurrentTab("sauce");
    else if (currentTab === "sauce") setCurrentTab("toppings");
    else if (currentTab === "toppings") setCurrentTab("review");
  };
  
  const goToPrevTab = () => {
    if (currentTab === "size") setCurrentTab("base");
    else if (currentTab === "crust") setCurrentTab("size");
    else if (currentTab === "sauce") setCurrentTab("crust");
    else if (currentTab === "toppings") setCurrentTab("sauce");
    else if (currentTab === "review") setCurrentTab("toppings");
  };
  
  // Toggle para seleção de toppings
  const toggleTopping = (topping: PizzaTopping) => {
    if (selectedToppings.some(t => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };
  
  // Calcula o preço total
  const calculateTotal = () => {
    let total = selectedBase?.price || 0;
    
    // Aplicar multiplicador de tamanho
    if (selectedSize) {
      total *= selectedSize.multiplier;
    }
    
    // Adicionar custo da borda
    if (selectedCrust) {
      total += selectedCrust.price;
    }
    
    // Adicionar custo do molho
    if (selectedSauce) {
      total += selectedSauce.price;
    }
    
    // Adicionar custo das coberturas
    total += selectedToppings.reduce((acc, topping) => acc + topping.price, 0);
    
    return total;
  };
  
  // Adiciona a pizza personalizada ao carrinho
  const addToCart = () => {
    if (!selectedBase || !selectedSize || !selectedCrust || !selectedSauce) {
      toast({
        title: "Atenção",
        description: "Por favor, complete todas as seleções antes de adicionar ao carrinho.",
        variant: "destructive",
      });
      return;
    }
    
    const toppingsDetail = selectedToppings.map(t => t.name).join(", ");
    const description = `Base: ${selectedBase.name}, Tamanho: ${selectedSize.name}, Borda: ${selectedCrust.name}, Molho: ${selectedSauce.name}${toppingsDetail ? `, Coberturas: ${toppingsDetail}` : ""}`;
    
    addItem({
      id: 0, // será substituído por um ID de item de menu real no carrinho
      name: "Pizza Personalizada",
      description,
      quantity: 1,
      price: calculateTotal(),
      specialInstructions,
    });
    
    toast({
      title: "Pizza adicionada ao carrinho",
      description: "Sua pizza personalizada foi adicionada ao carrinho.",
    });
    
    openCart();
    setLocation("/");
  };
  
  const isLoading = basesLoading || sizesLoading || crustsLoading || saucesLoading || toppingsLoading;
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2 text-lg">Carregando opções de personalização...</span>
      </div>
    );
  }

  // Renderiza a tela de personalização
  return (
    <div className="container mx-auto py-8 px-4 md:py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Personalize Sua Pizza</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visualização */}
        <div className="order-2 lg:order-1">
          <PizzaPreview
            selectedBase={selectedBase}
            selectedSize={selectedSize}
            selectedCrust={selectedCrust}
            selectedSauce={selectedSauce}
            selectedToppings={selectedToppings}
          />
          
          {/* Resumo do preço */}
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="text-xl font-bold mb-2">Resumo do Preço</h3>
            <div className="space-y-2">
              {selectedBase && (
                <div className="flex justify-between">
                  <span>Base ({selectedBase.name})</span>
                  <span>{formatCurrency(selectedBase.price)}</span>
                </div>
              )}
              
              {selectedSize && (
                <div className="flex justify-between">
                  <span>Tamanho ({selectedSize.name})</span>
                  <span>x{selectedSize.multiplier}</span>
                </div>
              )}
              
              {selectedCrust && selectedCrust.price > 0 && (
                <div className="flex justify-between">
                  <span>Borda ({selectedCrust.name})</span>
                  <span>{formatCurrency(selectedCrust.price)}</span>
                </div>
              )}
              
              {selectedSauce && selectedSauce.price > 0 && (
                <div className="flex justify-between">
                  <span>Molho ({selectedSauce.name})</span>
                  <span>{formatCurrency(selectedSauce.price)}</span>
                </div>
              )}
              
              {selectedToppings.length > 0 && (
                <>
                  <div className="flex justify-between font-medium">
                    <span>Coberturas</span>
                    <span>{formatCurrency(selectedToppings.reduce((acc, t) => acc + t.price, 0))}</span>
                  </div>
                  {selectedToppings.map(topping => (
                    <div key={topping.id} className="flex justify-between text-sm pl-4">
                      <span>{topping.name}</span>
                      <span>{topping.price > 0 ? formatCurrency(topping.price) : "Grátis"}</span>
                    </div>
                  ))}
                </>
              )}
              
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Seleções */}
        <div className="order-1 lg:order-2">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="base" className="flex-1">Base</TabsTrigger>
              <TabsTrigger value="size" className="flex-1">Tamanho</TabsTrigger>
              <TabsTrigger value="crust" className="flex-1">Borda</TabsTrigger>
              <TabsTrigger value="sauce" className="flex-1">Molho</TabsTrigger>
              <TabsTrigger value="toppings" className="flex-1">Coberturas</TabsTrigger>
              <TabsTrigger value="review" className="flex-1">Revisar</TabsTrigger>
            </TabsList>
            
            {/* Base */}
            <TabsContent value="base">
              <h2 className="text-2xl font-bold mb-4">Escolha a Base da Pizza</h2>
              <div className="grid grid-cols-1 gap-4">
                {bases?.map((base) => (
                  <Card 
                    key={base.id}
                    className={`cursor-pointer transition-all ${
                      selectedBase?.id === base.id ? "border-primary ring-2 ring-primary/30" : ""
                    }`}
                    onClick={() => setSelectedBase(base)}
                  >
                    <CardContent className="flex p-4">
                      {base.imageUrl && (
                        <div className="w-20 h-20 rounded-md overflow-hidden mr-4">
                          <img
                            src={base.imageUrl}
                            alt={base.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold">{base.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {base.description}
                        </p>
                        <p className="text-sm font-semibold mt-2">
                          {formatCurrency(base.price)}
                        </p>
                      </div>
                      {selectedBase?.id === base.id && (
                        <div className="flex items-center">
                          <Check className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={goToNextTab} disabled={!selectedBase}>
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            {/* Tamanho */}
            <TabsContent value="size">
              <h2 className="text-2xl font-bold mb-4">Escolha o Tamanho</h2>
              <div className="grid grid-cols-1 gap-4">
                {sizes?.map((size) => (
                  <Card 
                    key={size.id}
                    className={`cursor-pointer transition-all ${
                      selectedSize?.id === size.id ? "border-primary ring-2 ring-primary/30" : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    <CardContent className="flex p-4">
                      <div className="flex-1">
                        <h3 className="font-bold">{size.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {size.description}
                        </p>
                        <p className="text-sm font-semibold mt-2">
                          Multiplicador de preço: x{size.multiplier}
                        </p>
                      </div>
                      {selectedSize?.id === size.id && (
                        <div className="flex items-center">
                          <Check className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={goToPrevTab}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button onClick={goToNextTab} disabled={!selectedSize}>
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            {/* Borda */}
            <TabsContent value="crust">
              <h2 className="text-2xl font-bold mb-4">Escolha a Borda</h2>
              <div className="grid grid-cols-1 gap-4">
                {crusts?.map((crust) => (
                  <Card 
                    key={crust.id}
                    className={`cursor-pointer transition-all ${
                      selectedCrust?.id === crust.id ? "border-primary ring-2 ring-primary/30" : ""
                    }`}
                    onClick={() => setSelectedCrust(crust)}
                  >
                    <CardContent className="flex p-4">
                      <div className="flex-1">
                        <h3 className="font-bold">{crust.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {crust.description}
                        </p>
                        <p className="text-sm font-semibold mt-2">
                          {crust.price > 0 ? formatCurrency(crust.price) : "Grátis"}
                        </p>
                      </div>
                      {selectedCrust?.id === crust.id && (
                        <div className="flex items-center">
                          <Check className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={goToPrevTab}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button onClick={goToNextTab} disabled={!selectedCrust}>
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            {/* Molho */}
            <TabsContent value="sauce">
              <h2 className="text-2xl font-bold mb-4">Escolha o Molho</h2>
              <div className="grid grid-cols-1 gap-4">
                {sauces?.map((sauce) => (
                  <Card 
                    key={sauce.id}
                    className={`cursor-pointer transition-all ${
                      selectedSauce?.id === sauce.id ? "border-primary ring-2 ring-primary/30" : ""
                    }`}
                    onClick={() => setSelectedSauce(sauce)}
                  >
                    <CardContent className="flex p-4">
                      {sauce.imageUrl && (
                        <div className="w-20 h-20 rounded-md overflow-hidden mr-4">
                          <img
                            src={sauce.imageUrl}
                            alt={sauce.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold">{sauce.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {sauce.description}
                        </p>
                        <p className="text-sm font-semibold mt-2">
                          {sauce.price > 0 ? formatCurrency(sauce.price) : "Grátis"}
                        </p>
                      </div>
                      {selectedSauce?.id === sauce.id && (
                        <div className="flex items-center">
                          <Check className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={goToPrevTab}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button onClick={goToNextTab} disabled={!selectedSauce}>
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            {/* Coberturas */}
            <TabsContent value="toppings">
              <h2 className="text-2xl font-bold mb-4">Escolha as Coberturas</h2>
              
              {toppingsByCategory && Object.entries(toppingsByCategory).map(([category, toppings]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-xl font-medium mb-3">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {toppings.map((topping) => (
                      <ToppingSelector
                        key={topping.id}
                        topping={topping}
                        selected={selectedToppings.some(t => t.id === topping.id)}
                        onToggle={() => toggleTopping(topping)}
                      />
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={goToPrevTab}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button onClick={goToNextTab}>
                  Revisar Pedido <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            {/* Revisar */}
            <TabsContent value="review">
              <h2 className="text-2xl font-bold mb-4">Revisar e Finalizar</h2>
              
              <div className="bg-muted p-4 rounded-lg mb-6">
                <h3 className="font-bold mb-2">Resumo da Pizza</h3>
                <ul className="space-y-2">
                  <li><strong>Base:</strong> {selectedBase?.name || "Não selecionada"}</li>
                  <li><strong>Tamanho:</strong> {selectedSize?.name || "Não selecionado"}</li>
                  <li><strong>Borda:</strong> {selectedCrust?.name || "Não selecionada"}</li>
                  <li><strong>Molho:</strong> {selectedSauce?.name || "Não selecionado"}</li>
                  <li>
                    <strong>Coberturas:</strong>{" "}
                    {selectedToppings.length > 0
                      ? selectedToppings.map(t => t.name).join(", ")
                      : "Nenhuma cobertura selecionada"}
                  </li>
                  <li className="pt-2 border-t border-border">
                    <strong>Preço Total:</strong> {formatCurrency(calculateTotal())}
                  </li>
                </ul>
              </div>
              
              <div className="mb-6">
                <label
                  htmlFor="specialInstructions"
                  className="block text-sm font-medium mb-2"
                >
                  Instruções Especiais (opcional)
                </label>
                <textarea
                  id="specialInstructions"
                  className="w-full p-3 border border-border rounded-md"
                  rows={3}
                  placeholder="Alguma instrução especial para a preparação da sua pizza?"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={goToPrevTab}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button onClick={addToCart}>
                  Adicionar ao Carrinho
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}