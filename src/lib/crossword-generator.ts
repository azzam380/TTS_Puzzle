export type Direction = 'across' | 'down';

export interface WordInfo {
  word: string;
  clue: string;
  x?: number;
  y?: number;
  direction?: Direction;
  placed: boolean;
}

export interface GridResult {
  grid: string[][];
  placedWords: WordInfo[];
  failedWords: WordInfo[];
  width: number;
  height: number;
}

/**
 * CrosswordGenerator
 * 
 * ALGORITMA: INTERSECTION-SCORING BACKTRACKING
 * Pendekatan ini membangun grid dengan mencoba menempatkan kata satu per satu 
 * berdasarkan jumlah persimpangan (intersection) terbanyak untuk memaksimalkan kepadatan grid.
 */
export class CrosswordGenerator {
  private words: WordInfo[];
  private maxSize: number;

  constructor(words: { word: string; clue: string }[], maxSize: number = 25) {
    // Tahap Pre-processing: Membersihkan kata dan mensortir berdasarkan panjang (Longest First)
    // Kata yang lebih panjang ditempatkan lebih dulu sebagai 'jangkar' grid.
    this.words = words.map(w => ({
      ...w,
      word: w.word.toUpperCase().replace(/\s/g, ''),
      placed: false
    })).sort((a, b) => b.word.length - a.word.length);
    this.maxSize = maxSize;
  }

  public generate(): GridResult {
    // Inisialisasi grid kosong
    const grid: string[][] = Array(this.maxSize).fill(null).map(() => Array(this.maxSize).fill(''));

    if (this.words.length === 0) return this.finalizeGrid(grid);

    // 1. Penempatan Kata Pertama (Seed)
    // Ditempatkan di tengah grid secara horizontal untuk memberikan ruang luang di segala sisi.
    const firstWord = this.words[0];
    const startX = Math.floor((this.maxSize - firstWord.word.length) / 2);
    const startY = Math.floor(this.maxSize / 2);

    this.placeWord(grid, firstWord, startX, startY, 'across');

    // 2. Iterasi Penempatan Kata Berikutnya
    for (let i = 1; i < this.words.length; i++) {
      const wordObj = this.words[i];
      let bestPlacement = null;
      let maxIntersections = -1;

      // Mencari seluruh kemungkinan posisi (X, Y, Direction) yang valid
      const possiblePlacements = this.findPossiblePlacements(grid, wordObj.word);

      for (const placement of possiblePlacements) {
        // Scoring: Memilih posisi yang menghasilkan persimpangan (cross) terbanyak
        if (placement.intersections > maxIntersections) {
          maxIntersections = placement.intersections;
          bestPlacement = placement;
        }
      }

      // Jika ditemukan posisi yang valid, kunci kata tersebut ke dalam grid
      if (bestPlacement) {
        this.placeWord(grid, wordObj, bestPlacement.x, bestPlacement.y, bestPlacement.direction);
      }
    }

    // 3. Finalisasi: Memotong (crop) grid agar hanya seukuran area yang terisi
    return this.finalizeGrid(grid);
  }

  private placeWord(grid: string[][], wordInfo: WordInfo, x: number, y: number, direction: Direction) {
    wordInfo.x = x;
    wordInfo.y = y;
    wordInfo.direction = direction;
    wordInfo.placed = true;

    for (let i = 0; i < wordInfo.word.length; i++) {
      const curX = direction === 'across' ? x + i : x;
      const curY = direction === 'across' ? y : y + i;
      grid[curY][curX] = wordInfo.word[i];
    }
  }

  /**
   * findPossiblePlacements
   * Mencari semua huruf di grid yang sudah terisi dan mencoba mencocokkannya dengan 
   * huruf di kata baru (Intersection Search).
   */
  private findPossiblePlacements(grid: string[][], word: string) {
    const placements = [];

    for (let y = 0; y < this.maxSize; y++) {
      for (let x = 0; x < this.maxSize; x++) {
        if (grid[y][x] === '') continue; // Cari sel yang sudah ada hurufnya

        const char = grid[y][x];
        for (let i = 0; i < word.length; i++) {
          if (word[i] === char) {
            // Coba arah Mendatar (Across)
            const startX_Across = x - i;
            if (this.canPlace(grid, word, startX_Across, y, 'across')) {
              placements.push({
                x: startX_Across,
                y,
                direction: 'across' as const,
                intersections: this.countIntersections(grid, word, startX_Across, y, 'across')
              });
            }
            // Coba arah Menurun (Down)
            const startY_Down = y - i;
            if (this.canPlace(grid, word, x, startY_Down, 'down')) {
              placements.push({
                x,
                y: startY_Down,
                direction: 'down' as const,
                intersections: this.countIntersections(grid, word, x, startY_Down, 'down')
              });
            }
          }
        }
      }
    }
    return placements;
  }

  /**
   * canPlace
   * Validasi Aturan Crossword:
   * 1. Tidak boleh keluar batas grid.
   * 2. Huruf yang bersimpangan harus sama.
   * 3. Tidak boleh ada huruf "tetangga" yang tidak valid (tidak boleh nempel tanpa intersect).
   */
  private canPlace(grid: string[][], word: string, x: number, y: number, direction: Direction): boolean {
    if (x < 0 || y < 0) return false;
    const len = word.length;
    if (direction === 'across' && x + len > this.maxSize) return false;
    if (direction === 'down' && y + len > this.maxSize) return false;

    let intersections = 0;

    for (let i = 0; i < len; i++) {
      const curX = direction === 'across' ? x + i : x;
      const curY = direction === 'across' ? y : y + i;

      // Aturan 1: Jika sel sudah terisi, harus huruf yang sama
      if (grid[curY][curX] !== '' && grid[curY][curX] !== word[i]) return false;

      // Aturan 2: Jika sel kosong, cek sekeliling agar tidak menabrak kata lain secara ilegal
      if (grid[curY][curX] === '') {
        if (direction === 'across') {
          if (this.hasNeighbor(grid, curX, curY, 'vertical')) return false;
          if (i === 0 && this.isOccupied(grid, curX - 1, curY)) return false; // Cek kepala
          if (i === len - 1 && this.isOccupied(grid, curX + 1, curY)) return false; // Cek ekor
        } else {
          if (this.hasNeighbor(grid, curX, curY, 'horizontal')) return false;
          if (i === 0 && this.isOccupied(grid, curX, curY - 1)) return false; // Cek kepala
          if (i === len - 1 && this.isOccupied(grid, curX, curY + 1)) return false; // Cek ekor
        }
      } else {
        intersections++;
      }
    }

    // Harus ada minimal 1 persimpangan agar puzzle terhubung (kecuali kata pertama)
    return intersections > 0;
  }

  private isOccupied(grid: string[][], x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.maxSize || y >= this.maxSize) return false;
    return grid[y][x] !== '';
  }

  private hasNeighbor(grid: string[][], x: number, y: number, type: 'vertical' | 'horizontal') {
    if (type === 'vertical') {
      return this.isOccupied(grid, x, y - 1) || this.isOccupied(grid, x, y + 1);
    } else {
      return this.isOccupied(grid, x - 1, y) || this.isOccupied(grid, x + 1, y);
    }
  }

  private countIntersections(grid: string[][], word: string, x: number, y: number, direction: Direction): number {
    let count = 0;
    for (let i = 0; i < word.length; i++) {
      const curX = direction === 'across' ? x + i : x;
      const curY = direction === 'across' ? y : y + i;
      if (grid[curY][curX] === word[i]) count++;
    }
    return count;
  }

  private finalizeGrid(grid: string[][]): GridResult {
    let minX = this.maxSize, maxX = 0, minY = this.maxSize, maxY = 0;
    let anyPlaced = false;

    // Tahap Post-processing: Cari bounding box dari grid yang terisi
    for (let y = 0; y < this.maxSize; y++) {
      for (let x = 0; x < this.maxSize; x++) {
        if (grid[y][x] !== '') {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          anyPlaced = true;
        }
      }
    }

    if (!anyPlaced) return { grid: [], placedWords: [], failedWords: this.words, width: 0, height: 0 };

    const placedWords = this.words.filter(w => w.placed).map(w => ({
      ...w,
      x: (w.x || 0) - minX,
      y: (w.y || 0) - minY
    }));

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const finalGrid = Array(height).fill(null).map(() => Array(width).fill(''));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        finalGrid[y - minY][x - minX] = grid[y][x];
      }
    }

    return {
      grid: finalGrid,
      placedWords,
      failedWords: this.words.filter(w => !w.placed),
      width,
      height
    };
  }
}
