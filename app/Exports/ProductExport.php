<?php

namespace App\Exports;

use App\Models\Product;
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

class ProductExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
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
        $query = Product::with([
            'category:id,category_name',
            'subcategory:id,subcategory_name',
            'zone:id,zone_name',
            'rack:id,rack_name',
            'variants:id,product_id,sku_code,barcode_number',
            'user:id,first_name,last_name,email',
            'user.account:id,user_id,username'
        ])->orderBy('id', 'asc');

        // 應用篩選條件
        if (isset($this->filters['search']) && $this->filters['search']) {
            $search = $this->filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku_code', 'like', "%{$search}%")
                  ->orWhereHas('variants', function($vq) use ($search) {
                      $vq->where('barcode_number', 'like', "%{$search}%");
                  });
            });
        }

        if (isset($this->filters['ids']) && $this->filters['ids']) {
            $ids = is_array($this->filters['ids']) ? $this->filters['ids'] : explode(',', $this->filters['ids']);
            $query->whereIn('id', $ids);
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
            'Product Name',
            'Description',
            'SKU Code',
            'Barcode Number',
            'Category',
            'Subcategory',
            'Zone',
            'Rack',
            'Current Stock',
            'Price',
            'Status',
            'Created By',
            'Username',
        ];
    }

    /**
     * @param mixed $row
     * @return array
     */
    public function map($row): array
    {
        $variant = $row->variants->first();
        $skuCode = $variant->sku_code ?? 'N/A';
        $barcodeNumber = $variant->barcode_number ?? 'N/A';

        // 获取创建者信息
        $createdBy = 'N/A';
        if ($row->user) {
            $createdBy = trim(($row->user->first_name ?? '') . ' ' . ($row->user->last_name ?? ''));
            if (empty($createdBy)) {
                $createdBy = $row->user->email ?? 'N/A';
            }
        }

        $username = 'N/A';
        if ($row->user && $row->user->account) {
            $username = $row->user->account->username ?? 'N/A';
        }

        return [
            $row->id,
            $row->name,
            $row->description ?? 'N/A',
            $skuCode,
            $barcodeNumber,
            $row->category->category_name ?? 'N/A',
            $row->subcategory->subcategory_name ?? 'N/A',
            $row->zone->zone_name ?? 'N/A',
            $row->rack->rack_name ?? 'N/A',
            $row->quantity ?? 0,
            $row->price ?? 0,
            $row->product_status ?? 'N/A',
            $createdBy,
            $username,
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
            'B' => 30,  // Product Name
            'C' => 40,  // Description
            'D' => 20,  // SKU Code
            'E' => 20,  // Barcode Number
            'F' => 20,  // Category
            'G' => 20,  // Subcategory
            'H' => 15,  // Zone
            'I' => 15,  // Rack
            'J' => 12,  // Current Stock
            'K' => 12,  // Price
            'L' => 12,  // Status
            'M' => 25,  // Created By
            'N' => 20,  // Username
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
                $sheet->getStyle('J:K')->applyFromArray([
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);
                $sheet->getStyle('L:L')->applyFromArray([
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);
            },
        ];
    }
}

