<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;

class StockMovement extends Model
{
    use HasFactory;

    protected $table = 'stock_movements';

    protected $fillable = [
        'product_id',
        'variant_id',
        'movement_type',
        'quantity',
        'previous_stock',
        'current_stock',
        'reference_number',
        'notes',
        'movement_reason',
        'user_id',
        'movement_date',
    ];

    protected $casts = [
        'movement_date' => 'datetime',
        'quantity' => 'integer',
        'previous_stock' => 'integer',
        'current_stock' => 'integer',
    ];

    // 关系定义
    public function product(): BelongsTo {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function variant(): BelongsTo {
        return $this->belongsTo(ProductVariant::class, 'variant_id', 'id');
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // 辅助方法
    public function isStockIn(): bool {
        return $this->movement_type === 'stock_in';
    }

    public function isStockOut(): bool {
        return $this->movement_type === 'stock_out';
    }

    // 作用域查询
    public function scopeStockIn($query) {
        return $query->where('movement_type', 'stock_in');
    }

    public function scopeStockOut($query) {
        return $query->where('movement_type', 'stock_out');
    }

    public function scopeByProduct($query, $productId) {
        return $query->where('product_id', $productId);
    }

    public function scopeByUser($query, $userId) {
        return $query->where('user_id', $userId);
    }

    public function scopeByDateRange($query, $startDate, $endDate) {
        return $query->whereBetween('movement_date', [$startDate, $endDate]);
    }

    /**
     * 获取SKU代码 - 优先使用变体SKU，如果没有则使用产品SKU
     */
    public function getSkuCodeAttribute() {
        if ($this->variant && $this->variant->sku_code) {
            return $this->variant->sku_code;
        } elseif ($this->product && $this->product->sku_code) {
            return $this->product->sku_code;
        }
        return 'N/A';
    }

    /**
     * 获取用户名称
     */
    public function getUserNameAttribute() {
        return $this->user->name ?? 'Unknown User';
    }

    /**
     * 获取产品名称
     */
    public function getProductNameAttribute() {
        return $this->product->name ?? 'N/A';
    }
}
