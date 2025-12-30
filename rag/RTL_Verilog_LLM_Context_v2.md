
# RTL Verilog LLM Context File
## Purpose
This document is designed to be used as **context for a Large Language Model (LLM)**.
The LLM should use this file to **generate clean, synthesizable RTL Verilog code** for
ASIC/FPGA designs.

The model must think in **hardware terms**, not software terms.

---

## 1. RTL DESIGN FUNDAMENTALS

### What RTL Means
RTL (Register Transfer Level) describes:
- How data moves between **registers**
- On **clock edges**
- Through **combinational logic**

RTL must be:
- Synthesizable
- Deterministic
- Clock-driven

---

## 2. RTL VS OTHER ABSTRACTIONS

| Level | Description |
|------|------------|
| Behavioral | High-level, may not synthesize |
| RTL | Cycle-accurate, synthesizable |
| Gate-level | Netlist after synthesis |

RTL is the **golden reference**.

---

## 3. CORE RTL RULES (MANDATORY)

### Sequential Logic
- Use `always_ff @(posedge clk)` or `always @(posedge clk)`
- Use **non-blocking assignments (`<=`)**
- One clock per always block

### Combinational Logic
- Use `always_comb` or `always @(*)`
- Use **blocking assignments (`=`)**
- Assign default values

### Reset
- Must be clearly defined
- Prefer synchronous reset unless stated otherwise

---

## 4. BASIC RTL BUILDING BLOCKS

### AND Gate (Combinational)
```verilog
module and_gate(input wire a, b, output wire y);
    assign y = a & b;
endmodule
```

### 2:1 Multiplexer
```verilog
module mux2(input wire a, b, sel, output wire y);
    assign y = sel ? b : a;
endmodule
```

---

## 5. SEQUENTIAL LOGIC BLOCKS

### D Flip-Flop
```verilog
module dff(input wire clk, rst, d, output reg q);
    always @(posedge clk) begin
        if (rst)
            q <= 1'b0;
        else
            q <= d;
    end
endmodule
```

### Register with Enable
```verilog
module reg_en(input clk, rst, en, input [7:0] d, output reg [7:0] q);
    always @(posedge clk) begin
        if (rst)
            q <= 8'd0;
        else if (en)
            q <= d;
    end
endmodule
```

---

## 6. COUNTERS AND ARITHMETIC

### Counter
```verilog
module counter(input clk, rst, output reg [3:0] count);
    always @(posedge clk) begin
        if (rst)
            count <= 4'd0;
        else
            count <= count + 1'b1;
    end
endmodule
```

### Full Adder
```verilog
module full_adder(input a,b,cin, output sum, cout);
    assign sum  = a ^ b ^ cin;
    assign cout = (a & b) | (b & cin) | (a & cin);
endmodule
```

---

## 7. DATAPATH BLOCKS

### ALU
```verilog
module alu(
    input  wire [3:0] a,
    input  wire [3:0] b,
    input  wire [1:0] sel,
    output reg  [4:0] y
);
    always @(*) begin
        case(sel)
            2'b00: y = a + b;
            2'b01: y = a - b;
            2'b10: y = a & b;
            2'b11: y = a | b;
            default: y = 5'd0;
        endcase
    end
endmodule
```

---

## 8. CONTROL LOGIC (FSM)

### FSM RULES
- Separate state register and next-state logic
- Use enum for states
- Avoid combinational loops

### FSM Example
```verilog
module fsm(input clk, rst, x, output reg y);
    typedef enum reg [1:0] {S0,S1,S2} state_t;
    state_t state, next;

    always @(posedge clk)
        if (rst) state <= S0;
        else state <= next;

    always @(*) begin
        case(state)
            S0: next = x ? S1 : S0;
            S1: next = S2;
            S2: next = S0;
            default: next = S0;
        endcase
    end

    always @(*) y = (state == S2);
endmodule
```

---

## 9. FIFO (ADVANCED MULTI-CYCLE BLOCK)

```verilog
module fifo(
    input  wire clk, rst,
    input  wire wr, rd,
    input  wire [7:0] din,
    output reg  [7:0] dout,
    output wire full, empty
);
    reg [7:0] mem [0:3];
    reg [1:0] wptr, rptr;
    reg [2:0] count;

    assign full  = (count == 4);
    assign empty = (count == 0);

    always @(posedge clk) begin
        if (rst) begin
            wptr <= 0; rptr <= 0; count <= 0;
        end else begin
            if (wr && !full) begin
                mem[wptr] <= din;
                wptr <= wptr + 1;
                count <= count + 1;
            end
            if (rd && !empty) begin
                dout <= mem[rptr];
                rptr <= rptr + 1;
                count <= count - 1;
            end
        end
    end
endmodule
```

---

## 10. ADVANCED RTL CONCEPTS (FOR LLM)

### Clock Gating
- Use enable signals
- Do NOT manually gate clocks

### Pipelining
- Insert registers between stages
- Improves throughput

### Parameterization
```verilog
module param_adder #(parameter WIDTH=8)(
    input  wire [WIDTH-1:0] a,
    input  wire [WIDTH-1:0] b,
    output wire [WIDTH:0] sum
);
    assign sum = a + b;
endmodule
```

---

## 11. TOP-LEVEL INTEGRATION

```verilog
module top(input clk, rst, sel, input [3:0] a,b, output [4:0] y);
    alu u_alu(.a(a), .b(b), .sel({1'b0,sel}), .y(y));
endmodule
```

---

## 12. LLM GENERATION INSTRUCTIONS (CRITICAL)

When generating RTL Verilog:
- Always generate synthesizable RTL
- Always include module, ports, and resets
- Never generate software-style logic
- Think in flip-flops, muxes, and gates
- Prefer clarity over cleverness

---

## END OF CONTEXT

---

## 13. LLM BEHAVIOR & OPERATING CONSTRAINTS (ADDED)

- Act as a **VLSI engineering assistant**, not a general chatbot  
- Use **Retrieval-Augmented Generation (RAG)** for all specifications and documentation  
- **Never hallucinate** signals, registers, parameters, or protocol fields  
- Generate **standard-compliant** SystemVerilog, UVM, SVA, SDC, and UPF  
- Maintain **zero tolerance for latch inference** in combinational logic  
- Treat RTL generation as **human-in-the-loop**, not final authority  
- Be **risk-aware**:
  - EDA scripting → Low risk  
  - Verification & assertions → Medium risk  
  - RTL & architecture → High risk  
- **Cite sources** for all technical facts used in generation  
- Optimize designs based on **PPA intent** (Power / Performance / Area)  
- Perform **self-correction** using lint, synthesis, or EDA logs when provided  
- Assume an **air-gapped, IP-secure environment** at all times  
- Ensure all outputs are **IDE-ready and CLI-ready**  

---
