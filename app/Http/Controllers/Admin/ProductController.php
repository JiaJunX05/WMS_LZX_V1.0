<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Picqer\Barcode\BarcodeGeneratorPNG;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Image;
use App\Models\AttributeVariant;
use App\Models\ManagementTool\Brand;
use App\Models\ManagementTool\Color;
use App\Models\SizeLibrary\SizeLibrary;
use App\Models\CategoryMapping\Category;
use App\Models\CategoryMapping\Subcategory;
use App\Models\CategoryMapping\Mapping;
use App\Models\StorageLocation\Zone;
use App\Models\StorageLocation\Rack;
use App\Models\StorageLocation\Location;
use Illuminate\Support\Str;
use App\Models\User;

/**
 * 产品管理控制器
 *
 * 功能模块：
 * - 产品列表展示：搜索、筛选、分页
 * - 产品操作：创建、编辑、删除、状态管理
 * - 图片管理：封面图、详情图上传、更新、删除
 * - 条形码管理：生成、更新条形码
 *
 * @author WMS Team
 * @version 1.0.0
 */
class ProductController extends Controller
{
    /**
     * 产品列表页面
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // 如果是 AJAX 请求，返回 JSON 数据
        if ($request->ajax()) {
            try {
                $query = Product::with([
                    'category',
                    'subcategory',
                    'zone',
                    'rack',
                    'variants.attributeVariant.brand',
                    'variants.attributeVariant.color',
                    'variants.attributeVariant.size',
                    'variants.attributeVariant.size.category'
                ]);

                // 搜索条件：产品名称、SKU代码或条形码
                if ($request->filled('search')) {
                    $search = $request->input('search');
                    $query->where(function ($query) use ($search) {
                        $query->where('name', 'like', "%$search%")
                              ->orWhereHas('variants', function ($q) use ($search) {
                                $q->where('sku_code', 'like', "%$search%")
                                  ->orWhere('barcode_number', 'like', "%$search%");
                              });
                    });
                }

                // 分类筛选 - 支持多选
                if ($request->filled('category_id')) {
                    $categoryIds = $request->input('category_id');
                    if (is_array($categoryIds)) {
                        $query->whereIn('category_id', $categoryIds);
                    } else {
                        $query->where('category_id', $categoryIds);
                    }
                }

                // 子分类筛选 - 支持多选
                if ($request->filled('subcategory_id')) {
                    $subcategoryIds = $request->input('subcategory_id');
                    if (is_array($subcategoryIds)) {
                        $query->whereIn('subcategory_id', $subcategoryIds);
                    } else {
                        $query->where('subcategory_id', $subcategoryIds);
                    }
                }

                // 品牌筛选 - 支持多选
                if ($request->filled('brand_id')) {
                    $brandIds = $request->input('brand_id');
                    \Log::info('Brand filter received:', ['brand_id' => $brandIds, 'type' => gettype($brandIds)]);

                    $query->whereHas('variants.attributeVariant', function ($q) use ($brandIds) {
                        if (is_array($brandIds)) {
                            $q->whereIn('brand_id', $brandIds);
                        } else {
                            $q->where('brand_id', $brandIds);
                        }
                    });
                }

                // 分页设置
                $perPage = $request->input('perPage', 10);
                $products = $query->paginate($perPage);

                // 返回分页数据
                return response()->json([
                    'data' => $products->map(function ($product) {
                        $variant = $product->variants->first();
                        $attributeVariant = $variant ? $variant->attributeVariant : null;

                        return [
                            'id' => $product->id,
                            'name' => $product->name,
                            'description' => $product->description,
                            'price' => $product->price,
                            'quantity' => $product->quantity,
                            'sku_code' => $variant ? $variant->sku_code : 'N/A',
                            'cover_image' => $product->cover_image,
                            'category_name' => $product->category->category_name ?? 'N/A',
                            'subcategory_name' => $product->subcategory->subcategory_name ?? 'N/A',
                            'brand_name' => $attributeVariant && $attributeVariant->brand ? $attributeVariant->brand->brand_name : 'N/A',
                            'color_name' => $attributeVariant && $attributeVariant->color ? $attributeVariant->color->color_name : 'N/A',
                            'size_name' => $attributeVariant && $attributeVariant->size ? $attributeVariant->size->size_value : 'N/A',
                            'gender_name' => 'N/A', // SizeLibrary 不包含性别信息
                            'zone_name' => $product->zone->zone_name ?? 'N/A',
                            'rack_name' => $product->rack->rack_number ?? 'N/A',
                            'product_status' => $product->product_status,
                            'barcode_number' => $variant ? $variant->barcode_number : 'N/A',
                        ];
                    }),
                    'pagination' => [
                        'current_page' => $products->currentPage(),
                        'last_page' => $products->lastPage(),
                        'total' => $products->total(),
                        'per_page' => $products->perPage(),
                        'from' => $products->firstItem(),
                        'to' => $products->lastItem(),
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('Product management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch products'], 500);
            }
        }

        // 如果不是 AJAX 请求，返回视图
        // 为所有模型手动计算产品数量，避免模型关系问题

        // 为分类计算产品数量
        $categories = Category::all()->map(function ($category) {
            $category->products_count = Product::where('category_id', $category->id)->count();
            return $category;
        });

        // 为子分类计算产品数量
        $subcategories = Subcategory::all()->map(function ($subcategory) {
            $subcategory->products_count = Product::where('subcategory_id', $subcategory->id)->count();
            return $subcategory;
        });

        // 为品牌计算产品数量（通过变体关系）
        $brands = Brand::all()->map(function ($brand) {
            $brand->products_count = Product::whereHas('variants.attributeVariant', function ($query) use ($brand) {
                $query->where('brand_id', $brand->id);
            })->count();
            return $brand;
        });

        // 为颜色计算产品数量（通过变体关系）
        $colors = Color::all()->map(function ($color) {
            $color->products_count = Product::whereHas('variants.attributeVariant', function ($query) use ($color) {
                $query->where('color_id', $color->id);
            })->count();
            return $color;
        });

        return view('product_variants.products.dashboard', compact('categories', 'subcategories', 'brands', 'colors'));
    }

    /**
     * 显示创建产品表单
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        $categories = Category::all();
        $subcategories = Subcategory::all();
        $brands = Brand::all();
        $colors = Color::all();
        $sizes = SizeLibrary::with('category')->where('size_status', 'Available')->get();
        $zones = Zone::all();
        $racks = Rack::all();
        $locations = Location::with('zone', 'rack')->get();
        $mappings = Mapping::with('category', 'subcategory')->get();

        // 计算每个rack的可用容量（按产品数量计算）
        $rackCapacities = [];
        foreach ($racks as $rack) {
            $currentUsage = Product::where('rack_id', $rack->id)->count(); // 按产品数量计算
            $rackCapacities[$rack->id] = [
                'capacity' => $rack->capacity,
                'used' => $currentUsage,
                'available' => $rack->capacity - $currentUsage
            ];
        }

        // 生成建议的SKU和barcode
        $suggestedSKU = $this->generateSuggestedSKU();
        $suggestedBarcode = $this->generateBarcodeNumber($suggestedSKU);

        return view('product_variants.products.create', compact(
            'categories', 'subcategories', 'brands', 'colors', 'sizes', 'zones', 'racks', 'locations', 'mappings', 'rackCapacities', 'suggestedSKU', 'suggestedBarcode'
        ));
    }

    /**
     * 存储新产品
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        try {
            // 调试信息
            \Log::info('=== PRODUCT STORE DEBUG START ===');
            \Log::info('Product Store Request Data: ' . json_encode($request->all()));
            \Log::info('Rack ID from request: ' . ($request->rack_id ?? 'NULL'));
            \Log::info('Zone ID from request: ' . ($request->zone_id ?? 'NULL'));
            \Log::info('Request method: ' . $request->method());
            \Log::info('Request has rack_id: ' . ($request->has('rack_id') ? 'YES' : 'NO'));
            \Log::info('Request filled rack_id: ' . ($request->filled('rack_id') ? 'YES' : 'NO'));
            \Log::info('=== PRODUCT STORE DEBUG END ===');

            // 验证请求数据
            $request->validate([
                'cover_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'price' => 'required|numeric|min:0.01',
                'quantity' => 'required|integer|min:1',
                'sku_code' => 'nullable|string|max:255|unique:product_variants,sku_code',
                'category_id' => 'required|exists:categories,id',
                'subcategory_id' => 'required|exists:subcategories,id',
                'brand_id' => 'required|exists:brands,id',
                'color_id' => 'required|exists:colors,id',
                'size_id' => 'required|exists:size_libraries,id',
                'zone_id' => 'required|exists:zones,id',
                'rack_id' => 'nullable|exists:racks,id',
                'detail_image.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'barcode_number' => 'required|string|max:255|unique:product_variants,barcode_number',
                'product_status' => 'required|in:Available,Unavailable',
            ]);

            // 自动生成SKU（如果用户没有提供）
            $skuCode = $request->sku_code;
            if (empty($skuCode)) {
                $skuCode = $this->generateSKU($request);
            }

            // 自动生成barcode（总是生成，确保不为空）
            $barcodeNumber = $request->barcode_number;
            if (empty($barcodeNumber)) {
                $barcodeNumber = $this->generateBarcodeNumber($skuCode);
            }

            // 检查rack容量（按产品数量计算）
            if ($request->filled('rack_id')) {
                $rack = Rack::findOrFail($request->rack_id);
                $currentUsage = Product::where('rack_id', $request->rack_id)->count(); // 按产品数量计算
                $requestedItems = 1; // 每个产品占用1个位置

                if (($currentUsage + $requestedItems) > $rack->capacity) {
                    return redirect()->back()
                        ->withInput()
                        ->withErrors(['rack_id' => "Rack capacity exceeded. Available space: " . ($rack->capacity - $currentUsage) . ", Requested: 1 product"]);
                }
            }

            // 处理封面图片
            $coverImagePath = null;
            if ($request->hasFile('cover_image')) {
                $image = $request->file('cover_image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $directory = public_path('assets/images/products/covers');
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }
                $image->move($directory, $imageName);
                $coverImagePath = 'covers/' . $imageName;
            }

            // 创建产品记录前的调试信息
            \Log::info('=== PRODUCT CREATE DEBUG START ===');
            \Log::info('About to create product with rack_id: ' . ($request->rack_id ?? 'NULL'));
            \Log::info('About to create product with zone_id: ' . ($request->zone_id ?? 'NULL'));

            $productData = [
                'cover_image' => $coverImagePath,
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'quantity' => $request->quantity,
                'category_id' => $request->category_id,
                'subcategory_id' => $request->subcategory_id,
                'zone_id' => $request->zone_id,
                'rack_id' => $request->rack_id,
                'product_status' => $request->product_status ?? 'Available',
                'user_id' => auth()->user()->id,
            ];

            \Log::info('Product data array: ' . json_encode($productData));

            $product = Product::create($productData);

            \Log::info('Product created with ID: ' . $product->id);
            \Log::info('Created product rack_id: ' . ($product->rack_id ?? 'NULL'));
            \Log::info('Created product zone_id: ' . ($product->zone_id ?? 'NULL'));
            \Log::info('=== PRODUCT CREATE DEBUG END ===');

            // 创建产品变体
            $productVariant = ProductVariant::create([
                'product_id' => $product->id,
                'sku_code' => strtoupper($skuCode),
                'barcode_number' => $barcodeNumber,
            ]);

            \Log::info('Product variant created with ID: ' . $productVariant->id);

            // 创建属性变体
            AttributeVariant::create([
                'variant_id' => $productVariant->id,
                'brand_id' => $request->brand_id,
                'color_id' => $request->color_id,
                'size_id' => $request->size_id,
            ]);

            \Log::info('Attribute variant created for variant ID: ' . $productVariant->id);

            // 处理详情图片
            if ($request->hasFile('detail_image')) {
                foreach ($request->file('detail_image') as $image) {
                    $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                    $directory = public_path('assets/images/products/details');
                    if (!file_exists($directory)) {
                        mkdir($directory, 0777, true);
                    }
                    $image->move($directory, $imageName);

                    Image::create([
                        'detail_image' => 'details/' . $imageName,
                        'product_id' => $product->id,
                    ]);
                }
            }

            // 生成条形码图片（可选）
            $this->generateBarcodeImage($barcodeNumber, $skuCode, $productVariant->id);

            // 調試 AJAX 檢測
            \Log::info('AJAX Detection Debug:');
            \Log::info('request->ajax(): ' . ($request->ajax() ? 'true' : 'false'));
            \Log::info('request->wantsJson(): ' . ($request->wantsJson() ? 'true' : 'false'));
            \Log::info('X-Requested-With header: ' . ($request->header('X-Requested-With') ?? 'not set'));
            \Log::info('Accept header: ' . ($request->header('Accept') ?? 'not set'));

            // 如果是 AJAX 请求，返回 JSON 响应
            if ($request->ajax() || $request->wantsJson()) {
                \Log::info('Returning JSON response');
                return response()->json([
                    'success' => true,
                    'message' => 'Product created successfully',
                    'redirect' => route('product.index')
                ]);
            }

            \Log::info('Returning redirect response');

            return redirect()->route('product.index')
                            ->with('success', 'Product created successfully');
        } catch (\Exception $e) {
            Log::error('Product creation error: ' . $e->getMessage());
            if (isset($imageName) && file_exists($directory . '/' . $imageName)) {
                unlink($directory . '/' . $imageName);
            }

            // 如果是 AJAX 请求，返回 JSON 错误响应
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product creation failed: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Product creation failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 显示产品详情页面
     *
     * @param int $id 产品ID
     * @return \Illuminate\View\View
     */
    public function view($id)
    {
        try {
            $product = Product::with([
                'category',
                'subcategory',
                'zone',
                'rack',
                'images',
                'variants.attributeVariant.brand',
                'variants.attributeVariant.color',
                'variants.attributeVariant.size'
            ])->findOrFail($id);

            return view('product_variants.products.view', compact('product'));
        } catch (\Exception $e) {
            Log::error('Failed to load product view', [
                'product_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->route('product.index')
                            ->withErrors(['error' => 'Product not found or failed to load.']);
        }
    }

    /**
     * 显示编辑产品表单
     *
     * @param int $id 产品ID
     * @return \Illuminate\View\View
     */
    public function edit($id)
    {
        $product = Product::with([
            'images',
            'zone',
            'rack',
            'variants.attributeVariant.brand',
            'variants.attributeVariant.color',
            'variants.attributeVariant.size'
        ])->findOrFail($id);
        $categories = Category::all();
        $subcategories = Subcategory::all();
        $brands = Brand::all();
        $colors = Color::all();
        $sizes = SizeLibrary::with('category')->where('size_status', 'Available')->get();
        $zones = Zone::all();
        $racks = Rack::all();
        $locations = Location::with('zone', 'rack')->get();
        $mappings = Mapping::with('category', 'subcategory')->get();

        // 计算每个rack的可用容量（按产品数量计算）
        $rackCapacities = [];
        foreach ($racks as $rack) {
            $currentUsage = Product::where('rack_id', $rack->id)
                ->where('id', '!=', $id) // 排除当前产品
                ->count(); // 按产品数量计算
            $rackCapacities[$rack->id] = [
                'capacity' => $rack->capacity,
                'used' => $currentUsage,
                'available' => $rack->capacity - $currentUsage
            ];
        }

        return view('product_variants.products.update', compact(
            'product', 'categories', 'subcategories', 'brands', 'colors', 'sizes', 'zones', 'racks', 'locations', 'mappings', 'rackCapacities'
        ));
    }

    /**
     * 更新产品信息
     *
     * @param Request $request HTTP请求对象
     * @param int $id 产品ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // 验证请求数据
            $request->validate([
                'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'price' => 'required|numeric|min:0.01',
                'quantity' => 'required|integer|min:1',
                'sku_code' => 'required|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'subcategory_id' => 'required|exists:subcategories,id',
                'brand_id' => 'required|exists:brands,id',
                'color_id' => 'required|exists:colors,id',
                'size_id' => 'required|exists:size_libraries,id',
                'zone_id' => 'required|exists:zones,id',
                'rack_id' => 'nullable|exists:racks,id',
                'detail_image.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'remove_image.*' => 'nullable|integer|exists:images,id',
                'barcode_number' => 'required|string|max:255',
                'product_status' => 'required|in:Available,Unavailable',
            ]);

            $product = Product::with(['variants.attributeVariant'])->findOrFail($id);
            $variant = $product->variants->first();

            // 检查rack容量（按产品数量计算）
            if ($request->filled('rack_id')) {
                $rack = Rack::findOrFail($request->rack_id);
                $currentUsage = Product::where('rack_id', $request->rack_id)
                    ->where('id', '!=', $id) // 排除当前产品
                    ->count(); // 按产品数量计算
                $requestedItems = 1; // 每个产品占用1个位置

                if (($currentUsage + $requestedItems) > $rack->capacity) {
                    return redirect()->back()
                        ->withInput()
                        ->withErrors(['rack_id' => "Rack capacity exceeded. Available space: " . ($rack->capacity - $currentUsage) . ", Requested: 1 product"]);
                }
            }

            // 处理封面图片
            if ($request->hasFile('cover_image')) {
                // 删除旧图片
                if ($product->cover_image) {
                    $oldImagePath = public_path('assets/images/products/' . $product->cover_image);
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }

                // 上传新图片
                $image = $request->file('cover_image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $directory = public_path('assets/images/products/covers');
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }
                $image->move($directory, $imageName);
                $product->cover_image = 'covers/' . $imageName;
            }

            // 更新产品信息
            $product->name = $request->name;
            $product->description = $request->description;
            $product->price = $request->price;
            $product->quantity = $request->quantity;
            $product->category_id = $request->category_id;
            $product->subcategory_id = $request->subcategory_id;
            $product->zone_id = $request->zone_id;
            $product->rack_id = $request->rack_id;
            $product->product_status = $request->product_status ?? 'Available';
            $product->save();

            // 更新产品变体信息
            if ($variant) {
                $variant->sku_code = strtoupper($request->sku_code);
                $variant->barcode_number = $request->barcode_number;
                $variant->save();

                // 更新属性变体信息
                if ($variant->attributeVariant) {
                    $variant->attributeVariant->brand_id = $request->brand_id;
                    $variant->attributeVariant->color_id = $request->color_id;
                    $variant->attributeVariant->size_id = $request->size_id;
                    $variant->attributeVariant->save();
                } else {
                    // 如果不存在属性变体，创建一个新的
                    AttributeVariant::create([
                        'variant_id' => $variant->id,
                        'brand_id' => $request->brand_id,
                        'color_id' => $request->color_id,
                        'size_id' => $request->size_id,
                    ]);
                }
            }

            // 处理删除图片
            if ($request->has('remove_image')) {
                foreach ($request->remove_image as $imageId) {
                    $image = Image::find($imageId);
                    if ($image && $image->product_id == $product->id) {  // 确保图片属于当前产品
                        $imagePath = public_path('assets/images/products/' . $image->detail_image);
                        if (file_exists($imagePath)) {
                            unlink($imagePath);
                        }
                        $image->delete();
                    }
                }
            }

            // 处理详情图片
            if ($request->hasFile('detail_image')) {
                foreach ($request->file('detail_image') as $image) {
                    $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                    $directory = public_path('assets/images/products/details');
                    if (!file_exists($directory)) {
                        mkdir($directory, 0777, true);
                    }
                    $image->move($directory, $imageName);

                    Image::create([
                        'detail_image' => 'details/' . $imageName,
                        'product_id' => $product->id,
                    ]);
                }
            }

            // 处理条形码更新（条形码已经在变体更新中处理了）
            if ($variant && $request->filled('barcode_number')) {
                // 检查barcode号码是否发生变化
                $originalBarcode = $variant->barcode_number ?? '';
                $newBarcode = $request->barcode_number;

                Log::info('Barcode update check', [
                    'variant_id' => $variant->id,
                    'original_barcode' => $originalBarcode,
                    'new_barcode' => $newBarcode,
                    'barcode_changed' => $originalBarcode !== $newBarcode
                ]);

                if ($originalBarcode !== $newBarcode) {
                    // barcode号码发生变化，重新生成barcode图片
                    Log::info('Updating barcode for variant', ['variant_id' => $variant->id]);
                    $this->updateBarcodeImage($request->barcode_number, $request->sku_code, $variant->id);
                } else {
                    Log::info('Barcode number unchanged, skipping update', ['variant_id' => $variant->id]);
                }
            }

            // 檢查是否為 AJAX 請求
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Product updated successfully',
                    'redirect' => route('product.index')
                ]);
            }

            return redirect()->route('product.index')
                            ->with('success', 'Product updated successfully');
        } catch (\Exception $e) {
            Log::error('Product update error: ' . $e->getMessage());

            // 檢查是否為 AJAX 請求
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product update failed: ' . $e->getMessage()
                ], 422);
            }

            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Product update failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 删除产品
     *
     * @param int $id 产品ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            \Log::info('Product destroy called with ID: ' . $id);
            \Log::info('Request method: ' . request()->method());
            \Log::info('Request data: ' . json_encode(request()->all()));

            $product = Product::findOrFail($id);
            \Log::info('Product found: ' . json_encode($product->toArray()));

            // 删除封面图片
            if ($product->cover_image) {
                $coverPath = public_path('assets/images/products/' . $product->cover_image);
                if (file_exists($coverPath)) {
                    unlink($coverPath);
                }
            }

            // 删除详情图片
            $images = Image::where('product_id', $product->id)->get();
            foreach ($images as $image) {
                $detailPath = public_path('assets/images/products/' . $image->detail_image);
                if (file_exists($detailPath)) {
                    unlink($detailPath);
                }
                $image->delete();
            }

            // 删除变体相关数据（包括条形码图片）
            $variants = ProductVariant::where('product_id', $product->id)->get();
            foreach ($variants as $variant) {
                // 删除属性变体
                if ($variant->attributeVariant) {
                    $variant->attributeVariant->delete();
                }

                // 删除条形码图片（如果存在）
                // 这里可以添加条形码图片删除逻辑，如果你有存储条形码图片的话

                // 删除变体
                $variant->delete();
            }

            // 删除产品记录
            $product->delete();

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Product deleted successfully'
                ]);
            }

            return redirect()->route('product.index')
                            ->with('success', 'Product deleted successfully');
        } catch (\Exception $e) {
            Log::error('Product deletion error: ' . $e->getMessage());

            if (request()->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete product: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()
                            ->withErrors(['error' => 'Failed to delete product: ' . $e->getMessage()]);
        }
    }

    /**
     * 设置产品为可用状态
     *
     * @param int $id 产品ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            $product = Product::findOrFail($id);
            $product->product_status = 'Available';
            $product->save();

            Log::info('Product set to Available', [
                'product_id' => $product->id,
                'product_name' => $product->name
            ]);

            // 檢查是否為 AJAX 請求
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Product has been set to available status'
                ]);
            }

            return redirect()->back()
                            ->with('success', 'Product has been set to available status');
        } catch (\Exception $e) {
            Log::error('Failed to set product to Available', [
                'product_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            // 檢查是否為 AJAX 請求
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'An error occurred while setting product status. Please try again.'
                ], 422);
            }

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting product status. Please try again.']);
        }
    }

    /**
     * 设置产品为不可用状态
     *
     * @param int $id 产品ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            $product = Product::findOrFail($id);
            $product->product_status = 'Unavailable';
            $product->save();

            Log::info('Product set to Unavailable', [
                'product_id' => $product->id,
                'product_name' => $product->name
            ]);

            // 檢查是否為 AJAX 請求
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Product has been set to unavailable status'
                ]);
            }

            return redirect()->back()
                            ->with('success', 'Product has been set to unavailable status');
        } catch (\Exception $e) {
            Log::error('Failed to set product to Unavailable', [
                'product_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            // 檢查是否為 AJAX 請求
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'An error occurred while setting product status. Please try again.'
                ], 422);
            }

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting product status. Please try again.']);
        }
    }

    /**
     * 生成barcode号码
     *
     * @param string $skuCode SKU代码
     * @return string 生成的barcode号码
     */
    private function generateBarcodeNumber($skuCode)
    {
        // 基于SKU生成barcode号码
        $baseNumber = str_replace('-', '', $skuCode);
        $timestamp = time();
        $randomSuffix = rand(100, 999);

        // 生成13位barcode号码
        $barcodeNumber = $baseNumber . substr($timestamp, -6) . $randomSuffix;

        // 确保barcode号码唯一性
        $originalBarcode = $barcodeNumber;
        $counter = 1;
        while (ProductVariant::where('barcode_number', $barcodeNumber)->exists()) {
            $barcodeNumber = $originalBarcode . $counter;
            $counter++;
        }

        return $barcodeNumber;
    }

    /**
     * 生成建议的SKU代码（用于页面显示）
     *
     * @return string 建议的SKU代码
     */
    private function generateSuggestedSKU()
    {
        $dateCode = date('ymd'); // YYMMDD格式
        $randomCode = strtoupper(substr(uniqid(), -4)); // 4位随机码
        $sequenceNumber = Product::count() + 1; // 基于产品总数

        return 'PRD-' . $dateCode . '-' . str_pad($sequenceNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * 自动生成SKU代码
     *
     * @param Request $request 请求对象
     * @return string 生成的SKU代码
     */
    private function generateSKU($request)
    {
        // 获取产品信息
        $category = Category::find($request->category_id);
        $subcategory = Subcategory::find($request->subcategory_id);
        $brand = Brand::find($request->brand_id);
        $color = Color::find($request->color_id);

        // 生成SKU组件
        $categoryCode = $category ? strtoupper(substr($category->category_name, 0, 3)) : 'GEN';
        $subcategoryCode = $subcategory ? strtoupper(substr($subcategory->subcategory_name, 0, 2)) : 'XX';
        $brandCode = $brand ? strtoupper(substr($brand->brand_name, 0, 3)) : 'BRD';
        $colorCode = $color ? strtoupper(substr($color->color_name, 0, 2)) : 'XX';

        // 生成日期代码
        $dateCode = date('ymd'); // YYMMDD格式

        // 生成序列号
        $sequenceNumber = $this->getNextSequenceNumber($categoryCode, $subcategoryCode, $brandCode);

        // 组合SKU
        $sku = $categoryCode . '-' . $subcategoryCode . '-' . $brandCode . '-' . $colorCode . '-' . $dateCode . '-' . str_pad($sequenceNumber, 3, '0', STR_PAD_LEFT);

        // 确保SKU唯一性
        $originalSku = $sku;
        $counter = 1;
        while (ProductVariant::where('sku_code', $sku)->exists()) {
            $sku = $originalSku . '-' . $counter;
            $counter++;
        }

        return $sku;
    }

    /**
     * 获取下一个序列号
     *
     * @param string $categoryCode 分类代码
     * @param string $subcategoryCode 子分类代码
     * @param string $brandCode 品牌代码
     * @return int 下一个序列号
     */
    private function getNextSequenceNumber($categoryCode, $subcategoryCode, $brandCode)
    {
        // 查找相同前缀的SKU数量
        $prefix = $categoryCode . '-' . $subcategoryCode . '-' . $brandCode;
        $count = ProductVariant::where('sku_code', 'like', $prefix . '%')->count();

        return $count + 1;
    }

    /**
     * 生成条形码图片
     *
     * @param string $barcodeNumber 条形码号码
     * @param string $skuCode SKU代码
     * @param int $variantId 变体ID
     * @return void
     */
    private function generateBarcodeImage($barcodeNumber, $skuCode, $variantId)
    {
        $barcodeFolder = public_path('assets/images/products/barcodes');
        if (!file_exists($barcodeFolder)) {
            mkdir($barcodeFolder, 0777, true);
        }

        $sanitizedSkuCode = preg_replace('/[^A-Za-z0-9_\-]/', '_', $skuCode);
        $barcodeImageName = $sanitizedSkuCode . '_' . time() . '_' . uniqid() . '.png';
        $barcodePath = $barcodeFolder . '/' . $barcodeImageName;

        $generator = new BarcodeGeneratorPNG();
        $barcodeData = $generator->getBarcode($barcodeNumber, $generator::TYPE_CODE_128, 3, 50);

        if (file_put_contents($barcodePath, $barcodeData) !== false) {
            // 这里可以存储条形码图片路径到数据库，如果需要的话
            // 目前条形码号码已经存储在 ProductVariant 表中
            Log::info('Barcode image generated', [
                'variant_id' => $variantId,
                'barcode_path' => 'barcodes/' . $barcodeImageName
            ]);
        }
    }

    /**
     * 更新条形码图片
     *
     * @param string $barcodeNumber 条形码号码
     * @param string $skuCode SKU代码
     * @param int $variantId 变体ID
     * @return void
     */
    private function updateBarcodeImage($barcodeNumber, $skuCode, $variantId)
    {
        // 删除旧的条形码图片（如果有的话）
        // 这里可以添加删除旧条形码图片的逻辑

        // 生成新的条形码图片
        $this->generateBarcodeImage($barcodeNumber, $skuCode, $variantId);

        Log::info('Barcode image updated successfully', [
            'variant_id' => $variantId,
            'new_barcode_number' => $barcodeNumber,
            'sku_code' => $skuCode
        ]);
    }

}
