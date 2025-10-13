<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use App\Models\StockMovement;
use Illuminate\Support\Facades\Auth;

class StockHistoryExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $query = StockMovement::with([
            'user:id,name,email',
            'product:id,name,cover_image',
            'variant:id,product_id,sku_code,barcode_number'
        ])->orderBy('movement_date', 'desc');

        // 權限控制：Staff 只能看到自己的記錄，Admin 和 SuperAdmin 可以看到所有記錄
        $userRole = auth()->user()->getAccountRole();
        if ($userRole === 'Staff') {
            $query->where('user_id', auth()->id());
        }

        // 應用篩選條件
        if (isset($this->filters['start_date']) && $this->filters['start_date']) {
            $query->where('movement_date', '>=', $this->filters['start_date'] . ' 00:00:00');
        }

        if (isset($this->filters['end_date']) && $this->filters['end_date']) {
            $query->where('movement_date', '<=', $this->filters['end_date'] . ' 23:59:59');
        }

        if (isset($this->filters['movement_type']) && $this->filters['movement_type']) {
            $query->where('movement_type', $this->filters['movement_type']);
        }

        if (isset($this->filters['product_search']) && $this->filters['product_search']) {
            $search = $this->filters['product_search'];
            $query->where(function($q) use ($search) {
                $q->whereHas('product', function($productQuery) use ($search) {
                    $productQuery->where('name', 'like', "%{$search}%");
                })->orWhereHas('variant', function($variantQuery) use ($search) {
                    $variantQuery->where('sku_code', 'like', "%{$search}%")
                               ->orWhere('barcode_number', 'like', "%{$search}%");
                })->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        return $query->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Date',
            'Movement Type',
            'Product Name',
            'SKU Code',
            'Barcode Number',
            'Quantity',
            'Previous Stock',
            'Current Stock',
            'Reference Number',
            'User Name',
            'User Email',
        ];
    }

    /**
     * @param mixed $row
     * @return array
     */
    public function map($row): array
    {
        // 确定SKU - 优先使用variant的sku_code
        $skuCode = 'N/A';
        if ($row->variant && $row->variant->sku_code) {
            $skuCode = $row->variant->sku_code;
        }

        // 确定Barcode Number - 安全访问variant关系
        $barcodeNumber = 'N/A';
        if ($row->variant && $row->variant->barcode_number) {
            $barcodeNumber = $row->variant->barcode_number;
        }

        return [
            $row->id,
            $row->movement_date->format('Y-m-d H:i:s'),
            ucfirst(str_replace('_', ' ', $row->movement_type)),
            $row->product->name ?? 'N/A',
            $skuCode,
            $barcodeNumber,
            $row->quantity,
            $row->previous_stock,
            $row->current_stock,
            $row->reference_number ?? 'N/A',
            $row->user->name ?? 'Unknown User',
            $row->user->email ?? 'N/A',
        ];
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // 標題行樣式
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 12,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E3F2FD'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
        ];
    }

    /**
     * @return array
     */
    public function columnWidths(): array
    {
        return [
            'A' => 8,   // ID
            'B' => 20,  // Date
            'C' => 15,  // Movement Type
            'D' => 30,  // Product Name
            'E' => 15,  // SKU Code
            'F' => 20,  // Barcode Number
            'G' => 10,  // Quantity
            'H' => 12,  // Previous Stock
            'I' => 12,  // Current Stock
            'J' => 20,  // Reference Number
            'K' => 20,  // User Name
            'L' => 25,  // User Email
        ];
    }

    /**
     * @return array
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // 設置所有邊框
                $highestRow = $sheet->getHighestRow();
                $highestColumn = $sheet->getHighestColumn();

                $sheet->getStyle('A1:' . $highestColumn . $highestRow)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => 'CCCCCC'],
                        ],
                    ],
                ]);

                // 設置數據行對齊方式
                $sheet->getStyle('A2:' . $highestColumn . $highestRow)->applyFromArray([
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_LEFT,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                // 設置數字列居中對齊
                $sheet->getStyle('A:A')->applyFromArray([
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);
                $sheet->getStyle('G:I')->applyFromArray([
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);
            },
        ];
    }
}
