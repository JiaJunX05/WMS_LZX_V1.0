<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * User Export Class
 * 用戶數據導出類
 *
 * 功能：
 * - 導出用戶數據到Excel
 * - 支持篩選條件
 * - 格式化輸出
 *
 * @author WMS Team
 * @version 1.0.0
 */
class UserExport implements FromCollection, WithHeadings, WithMapping, WithStyles
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
        $query = User::query()->with(['account' => function ($query) {
            $query->select('id', 'user_id', 'username', 'account_role', 'account_status', 'user_image');
        }]);

        // 應用篩選條件
        if (isset($this->filters['search']) && $this->filters['search']) {
            $search = $this->filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (isset($this->filters['role']) && $this->filters['role']) {
            $query->whereHas('account', function($accountQuery) {
                $accountQuery->where('account_role', $this->filters['role']);
            });
        }

        if (isset($this->filters['status']) && $this->filters['status']) {
            $query->whereHas('account', function($accountQuery) {
                $accountQuery->where('account_status', $this->filters['status']);
            });
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
            'First Name',
            'Last Name',
            'Username',
            'Email',
            'Account Role',
            'Account Status',
            'User Image',
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
            $row->first_name,
            $row->last_name,
            $row->account->username ?? 'N/A',
            $row->email,
            $row->account->account_role ?? 'N/A',
            $row->account->account_status ?? 'N/A',
            $row->account->user_image ? asset('assets/images/auth/' . $row->account->user_image) : 'No Image',
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
