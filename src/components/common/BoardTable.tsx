import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box
} from '@mui/material';
import { FaEllipsisV } from 'react-icons/fa';

export interface BoardColumn {
  id: string;
  label: string;
  width?: string;
  renderCell?: (row: any) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface BoardAction {
  icon: React.ReactNode;
  label: string;
  onClick: (row: any) => void;
  tooltip?: string;
  color?: string;
  showCondition?: (row: any) => boolean;
}

interface BoardTableProps {
  columns: BoardColumn[];
  data: any[];
  actions?: BoardAction[];
  selectable?: boolean;
  onRowClick?: (row: any) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
  colorColumn?: string;
  className?: string;
}

const BoardTable: React.FC<BoardTableProps> = ({
  columns,
  data,
  actions,
  selectable = false,
  onRowClick,
  onSelectionChange,
  colorColumn,
  className = ''
}) => {
  const [selected, setSelected] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [actionRow, setActionRow] = useState<any>(null);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selected);
    }
  }, [selected, onSelectionChange]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(data);
      return;
    }
    setSelected([]);
  };

  const handleClick = (_event: React.MouseEvent<unknown>, row: any) => {
    if (!selectable) {
      if (onRowClick) onRowClick(row);
      return;
    }

    const selectedIndex = selected.findIndex((item) => item === row);
    let newSelected: any[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, row];
    } else {
      newSelected = selected.filter((_, index) => index !== selectedIndex);
    }

    setSelected(newSelected);
  };

  const isSelected = (row: any) => selected.indexOf(row) !== -1;

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>, row: any) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActionRow(row);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setActionRow(null);
  };

  const handleActionItemClick = (action: BoardAction) => {
    if (actionRow) {
      action.onClick(actionRow);
      handleActionClose();
    }
  };

  return (
    <Paper className={`overflow-hidden ${className}`} elevation={0}>
      <TableContainer className="max-h-[600px]">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAllClick}
                    inputProps={{ 'aria-label': 'select all' }}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ width: column.width || 'auto', whiteSpace: 'nowrap' }}
                  className="bg-white font-medium text-gray-700"
                >
                  {column.label}
                </TableCell>
              ))}
              {actions && actions.length > 0 && (
                <TableCell align="right" className="bg-white" style={{ width: '60px' }}>
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => {
              const isItemSelected = isSelected(row);
              const labelId = `board-table-checkbox-${index}`;

              // Determine if row should have a color indicator
              let colorIndicator = null;
              if (colorColumn && row[colorColumn]) {
                const colorMap: Record<string, string> = {
                  error: '#FEE2E2',
                  warning: '#FEF3C7',
                  info: '#DBEAFE',
                  success: '#D1FAE5',
                  active: '#DBEAFE',
                  inactive: '#F3F4F6',
                  pending: '#FEF3C7',
                  completed: '#D1FAE5',
                  cancelled: '#F3F4F6'
                };
                
                const color = colorMap[row[colorColumn].toLowerCase()] || '#F3F4F6';
                colorIndicator = (
                  <Box
                    sx={{
                      width: '4px',
                      height: '100%',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      backgroundColor: color
                    }}
                  />
                );
              }

              return (
                <TableRow
                  hover
                  onClick={(event) => handleClick(event, row)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={index}
                  selected={isItemSelected}
                  className="relative cursor-pointer"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  {colorIndicator}
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        inputProps={{ 'aria-labelledby': labelId }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      className="py-3"
                    >
                      {column.renderCell ? column.renderCell(row) : row[column.id]}
                    </TableCell>
                  ))}
                  {actions && actions.length > 0 && (
                    <TableCell align="right" className="pr-2">
                      <Tooltip title="Ações">
                        <IconButton
                          size="small"
                          onClick={(event) => handleActionClick(event, row)}
                        >
                          <FaEllipsisV className="text-gray-500" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions && actions.length > 0 ? 1 : 0)}
                  align="center"
                  className="py-8"
                >
                  <Typography variant="body1" color="textSecondary">
                    Nenhum dado encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              borderRadius: '4px',
              mx: 0.5
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {actions?.map((action, index) => {
          // Check if action should be shown for this row
          if (action.showCondition && actionRow && !action.showCondition(actionRow)) {
            return null;
          }
          
          return (
            <MenuItem
              key={index}
              onClick={() => handleActionItemClick(action)}
              sx={{
                '&:hover': {
                  backgroundColor: action.color ? `${action.color}10` : undefined
                }
              }}
            >
              <ListItemIcon style={{ color: action.color || 'inherit' }}>
                {action.icon}
              </ListItemIcon>
              <ListItemText primary={action.label} />
            </MenuItem>
          );
        })}
      </Menu>
    </Paper>
  );
};

export default BoardTable;