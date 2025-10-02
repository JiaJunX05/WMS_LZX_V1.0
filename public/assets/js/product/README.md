# Product JavaScript Files

这个文件夹包含了所有产品管理相关的JavaScript文件。

## 文件结构

- `product-create.js` - 产品创建页面专用JavaScript功能
- `product-update.js` - 产品更新页面专用JavaScript功能
- `product-view.js` - 产品查看页面专用JavaScript功能
- `product-dashboard.js` - 产品仪表板页面专用JavaScript功能

## 使用说明

### 推荐使用方式
每个产品页面需要引用对应的JavaScript文件：
```html
<script src="{{ asset('assets/js/product/product-[page].js') }}"></script>
```

例如：
- Create页面：`product-create.js`
- Update页面：`product-update.js`
- View页面：`product-view.js`
- Dashboard页面：`product-dashboard.js`

## 功能模块说明

### product-create.js (创建页面功能)
1. **图片预览功能** - 封面图片和详细图片预览
2. **级联选择功能** - 分类和子分类级联选择
3. **SKU生成功能** - 自动生成SKU和条形码
4. **状态选择功能** - 产品状态卡片选择
5. **表单验证功能** - 表单数据验证和提交

### product-update.js (更新页面功能)
1. **现有图片管理** - 现有图片的删除和标记
2. **新图片预览** - 新上传图片的预览功能
3. **级联选择功能** - 分类和子分类级联选择
4. **SKU生成功能** - 自动生成SKU和条形码
5. **状态选择功能** - 产品状态卡片选择
6. **表单验证功能** - 表单数据验证和提交

### product-view.js (查看页面功能)
1. **图片画廊功能** - 产品图片的展示和切换
2. **操作按钮功能** - 编辑、删除等操作按钮
3. **状态显示功能** - 产品状态信息展示

### product-dashboard.js (仪表板页面功能)
1. **筛选功能** - 产品筛选和搜索
2. **分页功能** - 产品列表分页
3. **排序功能** - 产品列表排序
4. **批量操作** - 批量选择和操作

## 优势

1. **模块化设计** - 每个页面有独立的JavaScript文件
2. **功能分离** - 不同页面的功能互不干扰
3. **易于维护** - 修改某个页面的功能只需要改对应文件
4. **性能优化** - 只加载需要的JavaScript功能
5. **清晰结构** - 功能职责分明，便于理解和维护

## 更新历史

- 2024-01-XX: 创建页面专用JavaScript文件
- 2024-01-XX: 重新组织文件结构，移至product文件夹
- 2024-01-XX: 优化JavaScript代码，移除重复功能
- 2024-01-XX: 统一命名规范和代码风格
- 2024-01-XX: 删除未使用的product-management.js文件
