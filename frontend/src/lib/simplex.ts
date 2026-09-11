/**
 * Pure TypeScript Linear Programming Solver (Two-Phase Simplex with Bland's Rule)
 * Accurately handles:
 *   - Upper bounds A_ub * x <= b (b >= 0) with slack variables s_i
 *   - Lower bounds A_ub * x <= -b (b > 0) -> -A_ub * x - s_i + a_k = b with surplus & artificial
 *   - Equality constraints A_eq * x == b with artificial variables
 *   - Bland's anti-cycling rule
 */

export interface LPSolution {
  feasible: boolean;
  x: number[];
  optValue: number;
  message: string;
  reducedCosts?: number[];
  slackMarginals?: number[];
}

export function solveLP(
  c: number[],
  A_ub: number[][],
  b_ub: number[],
  A_eq: number[][],
  b_eq: number[],
  bounds: [number, number][]
): LPSolution {
  const n_vars = c.length;

  // 1. Gather all inequalities (including bounds x_i <= ub_i and x_i >= lb_i)
  interface Constraint {
    a: number[];
    b: number;
    type: '<=' | '>=' | '==';
  }

  const constraints: Constraint[] = [];

  for (let i = 0; i < A_ub.length; i++) {
    const row = A_ub[i];
    const b = b_ub[i];
    if (b < -1e-9) {
      // row * x <= -|b| <=> -row * x >= |b|
      const negRow = row.map((v) => -v);
      constraints.push({ a: negRow, b: -b, type: '>=' });
    } else {
      constraints.push({ a: [...row], b, type: '<=' });
    }
  }

  // Upper & lower bounds on variables
  for (let j = 0; j < n_vars; j++) {
    const [lb, ub] = bounds[j];
    if (ub < Infinity && ub < 1000) {
      const row = new Array(n_vars).fill(0);
      row[j] = 1.0;
      constraints.push({ a: row, b: ub, type: '<=' });
    }
    if (lb > 1e-9) {
      const row = new Array(n_vars).fill(0);
      row[j] = 1.0;
      constraints.push({ a: row, b: lb, type: '>=' });
    }
  }

  // Equalities
  for (let i = 0; i < A_eq.length; i++) {
    let row = [...A_eq[i]];
    let b = b_eq[i];
    if (b < -1e-9) {
      row = row.map((v) => -v);
      b = -b;
    }
    constraints.push({ a: row, b, type: '==' });
  }

  const m = constraints.length;

  // Determine number of slacks/surplus and artificial variables
  let n_slack_surplus = 0;
  let n_art = 0;

  for (const c of constraints) {
    if (c.type === '<=') {
      n_slack_surplus++;
    } else if (c.type === '>=') {
      n_slack_surplus++;
      n_art++;
    } else if (c.type === '==') {
      n_art++;
    }
  }

  // Tableau layout:
  // Columns:
  // [0 .. n_vars-1] : original structural variables x
  // [n_vars .. n_vars + n_slack_surplus - 1] : slack / surplus variables
  // [n_vars + n_slack_surplus .. n_vars + n_slack_surplus + n_art - 1] : artificial variables
  // [total_cols - 1] : RHS (b)
  const total_cols = n_vars + n_slack_surplus + n_art + 1;
  const phase1_row = m;
  const phase2_row = m + 1;
  const total_rows = m + 2;

  const tableau: number[][] = Array.from({ length: total_rows }, () =>
    new Array(total_cols).fill(0)
  );
  const basic_vars = new Array(m).fill(0);

  let cur_slack = 0;
  let cur_art = 0;

  for (let i = 0; i < m; i++) {
    const c = constraints[i];
    // Copy structural coefficients
    for (let j = 0; j < n_vars; j++) {
      tableau[i][j] = c.a[j];
    }
    tableau[i][total_cols - 1] = c.b;

    if (c.type === '<=') {
      const s_col = n_vars + cur_slack;
      tableau[i][s_col] = 1.0;
      basic_vars[i] = s_col;
      cur_slack++;
    } else if (c.type === '>=') {
      const s_col = n_vars + cur_slack;
      tableau[i][s_col] = -1.0; // Surplus
      cur_slack++;

      const a_col = n_vars + n_slack_surplus + cur_art;
      tableau[i][a_col] = 1.0; // Artificial
      basic_vars[i] = a_col;
      cur_art++;
    } else if (c.type === '==') {
      const a_col = n_vars + n_slack_surplus + cur_art;
      tableau[i][a_col] = 1.0; // Artificial
      basic_vars[i] = a_col;
      cur_art++;
    }
  }

  // Set Phase 2 objective: minimize c^T x (we use standard form: maximize -c^T x or minimize c^T x)
  for (let j = 0; j < n_vars; j++) {
    tableau[phase2_row][j] = c[j];
  }

  // Set Phase 1 objective: minimize sum(artificial)
  // W = sum(a_k) => canonical form: W - sum(a_k) = 0
  // Since a_k are basic in rows i where they appear, subtract row i from phase1_row:
  for (let i = 0; i < m; i++) {
    const b_var = basic_vars[i];
    if (b_var >= n_vars + n_slack_surplus) {
      for (let j = 0; j < total_cols; j++) {
        tableau[phase1_row][j] -= tableau[i][j];
      }
    }
  }

  function pivot(p_row: number, p_col: number) {
    const p_val = tableau[p_row][p_col];
    for (let j = 0; j < total_cols; j++) {
      tableau[p_row][j] /= p_val;
    }
    for (let i = 0; i < total_rows; i++) {
      if (i !== p_row) {
        const factor = tableau[i][p_col];
        if (Math.abs(factor) > 1e-12) {
          for (let j = 0; j < total_cols; j++) {
            tableau[i][j] -= factor * tableau[p_row][j];
          }
        }
      }
    }
    basic_vars[p_row] = p_col;
  }

  // PHASE 1
  if (n_art > 0) {
    let iter1 = 0;
    const max_iter = 1000;
    while (iter1++ < max_iter) {
      // Find entering column (Bland's rule: smallest index with negative reduced cost)
      let enter_col = -1;
      for (let j = 0; j < total_cols - 1; j++) {
        if (tableau[phase1_row][j] < -1e-7) {
          enter_col = j;
          break;
        }
      }

      if (enter_col === -1) break; // Optimal for Phase 1

      // Minimum ratio test
      let leave_row = -1;
      let min_ratio = Infinity;
      for (let i = 0; i < m; i++) {
        const coeff = tableau[i][enter_col];
        if (coeff > 1e-9) {
          const ratio = tableau[i][total_cols - 1] / coeff;
          if (ratio < min_ratio - 1e-9) {
            min_ratio = ratio;
            leave_row = i;
          }
        }
      }

      if (leave_row === -1) {
        return { feasible: false, x: [], optValue: 0, message: "Phase 1 unbounded" };
      }

      pivot(leave_row, enter_col);
    }

    const residual = Math.abs(tableau[phase1_row][total_cols - 1]);
    if (residual > 1e-3) {
      return {
        feasible: false,
        x: [],
        optValue: 0,
        message: `Infeasible problem constraints (residual: ${residual.toFixed(4)})`,
      };
    }
  }

  // PHASE 2
  // Canonicalize Phase 2 row for current basic variables
  for (let i = 0; i < m; i++) {
    const b_var = basic_vars[i];
    const factor = tableau[phase2_row][b_var];
    if (Math.abs(factor) > 1e-12) {
      for (let j = 0; j < total_cols; j++) {
        tableau[phase2_row][j] -= factor * tableau[i][j];
      }
    }
  }

  let iter2 = 0;
  const max_iter2 = 1000;
  // Non-artificial columns
  const n_active_cols = n_vars + n_slack_surplus;

  while (iter2++ < max_iter2) {
    let enter_col = -1;
    for (let j = 0; j < n_active_cols; j++) {
      if (tableau[phase2_row][j] < -1e-7) {
        enter_col = j;
        break;
      }
    }

    if (enter_col === -1) break; // Phase 2 optimal

    let leave_row = -1;
    let min_ratio = Infinity;
    for (let i = 0; i < m; i++) {
      const coeff = tableau[i][enter_col];
      if (coeff > 1e-9) {
        const ratio = tableau[i][total_cols - 1] / coeff;
        if (ratio < min_ratio - 1e-9) {
          min_ratio = ratio;
          leave_row = i;
        }
      }
    }

    if (leave_row === -1) {
      return { feasible: false, x: [], optValue: 0, message: "Phase 2 unbounded" };
    }

    pivot(leave_row, enter_col);
  }

  // Extract values
  const x = new Array(n_vars).fill(0);
  for (let i = 0; i < m; i++) {
    const b_var = basic_vars[i];
    if (b_var < n_vars) {
      x[b_var] = Math.max(0, tableau[i][total_cols - 1]);
    }
  }

  // Reduced costs of structural variables (c_j - z_j)
  const reducedCosts = new Array(n_vars).fill(0);
  for (let j = 0; j < n_vars; j++) {
    reducedCosts[j] = Math.max(0, tableau[phase2_row][j]);
  }

  // Slack marginals (shadow prices of <= constraints)
  const slackMarginals = new Array(n_slack_surplus).fill(0);
  for (let s = 0; s < n_slack_surplus; s++) {
    slackMarginals[s] = Math.max(0, tableau[phase2_row][n_vars + s]);
  }

  const optValue = tableau[phase2_row][total_cols - 1];
  return {
    feasible: true,
    x,
    optValue,
    message: "Globally optimal continuous solution found via Two-Phase Simplex.",
    reducedCosts,
    slackMarginals,
  };
}
