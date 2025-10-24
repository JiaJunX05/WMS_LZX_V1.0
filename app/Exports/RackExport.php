<?php

namespace App\Exports;

use App\Models\Rack;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Rack Export Class
 * 貨架數據導出類
 *
 * 功能：
 * - 導出貨架數據到Excel
 * - 支持篩選條件
 * - 格式化輸出
 *
 * @author WMS Team
 * @version 1.0.0
 */
class RackExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $query = Rack::query();

        // 應用篩選條件
        if (isset($this->filters['search']) && $this->filters['search']) {
            $search = $this->filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('rack_number', 'like', "%{$search}%");
            });
        }

        if (isset($this->filters['status_filter']) && $this->filters['status_filter']) {
            $query->where('rack_status', $this->filters['status_filter']);
        }

        if (isset($this->filters['ids']) && is_array($this->filters['ids']) && !empty($this->filters['ids'])) {
            $query->whereIn('id', $this->filters['ids']);
        }

        return $query->orderBy('id', 'asc')->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Rack Number',
            'Capacity',
            'Status',
            'Image',
            'Created At',
            'Updated At',
        ];
    }

    /**
     * @param mixed $row
     * @return array
     */
    public function map($row): array
    {
        return [
            $row->id,
            $row->rack_number,
            $row->capacity,
            $row->rack_status,
            $row->rack_image ? asset('assets/images/' . $row->rack_image) : 'No Image',
            $row->created_at->format('Y-m-d H:i:s'),
            $row->updated_at->format('Y-m-d H:i:s'),
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
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => [
                        'rgb' => 'E3F2FD',
                    ],
                ],
            ],
        ];
    }
}
