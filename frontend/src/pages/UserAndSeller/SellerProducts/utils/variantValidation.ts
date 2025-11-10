/**
 * Utility functions for validating product variants and storage JSON
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  accounts?: Array<{
    username: string;
    password: string;
    status?: boolean;
  }>;
}

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  duplicateUsernames: string[];
  errorMessage?: string;
}

/**
 * Extract usernames from storage JSON string
 */
export const extractUsernamesFromStorageJson = (storageJson: string): string[] => {
  if (!storageJson || storageJson.trim() === "") {
    return [];
  }

  try {
    const parsed = JSON.parse(storageJson);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (item && typeof item === "object" && item.username) {
          return String(item.username).toLowerCase().trim();
        }
        return null;
      })
      .filter((username): username is string => username !== null && username !== "");
  } catch {
    return [];
  }
};

/**
 * Validate storage JSON format and structure
 */
export const validateStorageJson = (storageJson: string): ValidationResult => {
  if (!storageJson || storageJson.trim() === "") {
    return { isValid: true, accounts: [] };
  }

  try {
    const parsed = JSON.parse(storageJson);
    
    if (!Array.isArray(parsed)) {
      return { isValid: false, error: "Storage JSON phải là một mảng" };
    }

    const accounts: Array<{ username: string; password: string; status?: boolean }> = [];
    for (let i = 0; i < parsed.length; i++) {
      const account = parsed[i];
      
      if (!account || typeof account !== "object") {
        return { isValid: false, error: `Tài khoản thứ ${i + 1} không hợp lệ (phải là object)` };
      }

      if (!account.username || typeof account.username !== "string" || account.username.trim() === "") {
        return { isValid: false, error: `Tài khoản thứ ${i + 1} thiếu username hoặc username không hợp lệ` };
      }

      if (!account.password || typeof account.password !== "string" || account.password.trim() === "") {
        return { isValid: false, error: `Tài khoản thứ ${i + 1} thiếu password hoặc password không hợp lệ` };
      }

      if (account.status !== undefined && typeof account.status !== "boolean") {
        return { isValid: false, error: `Tài khoản thứ ${i + 1} có status không hợp lệ (phải là boolean)` };
      }

      accounts.push({
        username: account.username,
        password: account.password,
        status: account.status !== undefined ? account.status : false,
      });
    }

    return { isValid: true, accounts };
  } catch (error) {
    return { 
      isValid: false, 
      error: `Storage JSON không hợp lệ: ${error instanceof Error ? error.message : "Lỗi không xác định"}` 
    };
  }
};

/**
 * Check for duplicate usernames within a single variant
 */
export const checkDuplicateUsernamesInVariant = (
  variantName: string,
  storageJson: string
): DuplicateCheckResult => {
  if (!storageJson || storageJson.trim() === "") {
    return { hasDuplicate: false, duplicateUsernames: [] };
  }

  const usernames = extractUsernamesFromStorageJson(storageJson);
  const usernameMap = new Map<string, number[]>();
  
  usernames.forEach((username, index) => {
    if (!usernameMap.has(username)) {
      usernameMap.set(username, []);
    }
    usernameMap.get(username)!.push(index + 1);
  });

  const duplicateUsernames: string[] = [];
  usernameMap.forEach((indices, username) => {
    if (indices.length > 1) {
      duplicateUsernames.push(username);
    }
  });

  if (duplicateUsernames.length > 0) {
    const firstDuplicate = duplicateUsernames[0];
    const indices = usernameMap.get(firstDuplicate)!;
    const indicesString = indices.map(idx => `tài khoản thứ ${idx}`).join(", ");
    
    return {
      hasDuplicate: true,
      duplicateUsernames,
      errorMessage: `Variant "${variantName}" có username trùng lặp: "${firstDuplicate}" tại ${indicesString}. Vui lòng kiểm tra lại.`,
    };
  }

  return { hasDuplicate: false, duplicateUsernames: [] };
};

/**
 * Validate variant stock matches accounts count
 */
export const validateVariantStock = (
  variantName: string,
  stock: number | undefined | null,
  accountsCount: number
): { isValid: boolean; error?: string } => {
  if (stock === undefined || stock === null) {
    return { isValid: true };
  }

  if (stock === 0 && accountsCount > 0) {
    return {
      isValid: false,
      error: `Variant "${variantName}" có Stock = 0. Vui lòng nhập Stock > 0 trước khi thêm tài khoản.`,
    };
  }
  
  if (accountsCount > 0 && accountsCount !== stock) {
    return {
      isValid: false,
      error: `Variant "${variantName}": Số lượng tài khoản (${accountsCount}) không khớp với số lượng Stock (${stock}). Vui lòng kiểm tra lại.`,
    };
  }

  return { isValid: true };
};

