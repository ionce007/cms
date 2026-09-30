// types/download.ts

export interface FormulaItem {
    fs_id: number;
    path: string;
    server_filename: string;
    size: number;
    server_mtime: number;
    server_ctime: number;
    local_mtime: number;
    local_ctime: number;
    isdir: number;
    category: number;
    md5: string;
    dir_empty: number;
    price: number;
    isSell: number;
    xhsUrl: string;
    img: string;
    kind: string;
    summary: string;
    content: string;
    views: number;
    likes: number;
    status: number;
    author: {
        name: string;
        avatar: string;
    };
    createtime: string;
    lastupdate: string;
}

export interface FormulaCategory {
    value: number;
    label: string;
    icon: string;
}

export interface FormulaKind {
    value: string;
    label: string;
    icon: string;
}