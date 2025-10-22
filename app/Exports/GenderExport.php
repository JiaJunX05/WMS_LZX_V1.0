<?php

namespace App\Exports;

use App\Models\Gender;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Gender Export Class
 * 性別數據導出類
 *
 * 功能：
 * - 導出性別數據到Excel
 * - 支持篩選條件
 * - 格式化輸出
 *
 * @author WMS Team
 * @version 1.0.0
 */
class GenderExport implements FromCollection, WithHeadings, WithMapping, WithStyles
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
        $query = Gender::query();

        // 應用篩選條件
        if (isset($this->filters['search']) && $this->filters['search']) {
            $search = $this->filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('gender_name', 'like', "%{$search}%");
            });
        }

        if (isset($this->filters['status_filter']) && $this->filters['status_filter']) {
            $query->where('gender_status', $this->filters['status_filter']);
        }

        if (isset($this->filters['ids']) && is_array($this->filters['ids']) && !empty($this->filters['ids'])) {
            $query->whereIn('id', $this->filters['ids']);
        }

        return $query->orderBy('gender_name', 'asc')->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Gender Name',
            'Sizes Count',
            'Status',
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
            $row->gender_name,
            $row->sizes ? $row->sizes->count() : 0,
            $row->gender_status,
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
