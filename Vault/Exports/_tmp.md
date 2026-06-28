
# M01 $\cdot$ Algebraic Expressions

> **Goal --- Objectives**
>
> - Perform math operations on polynomials
> - Find principal square roots
> - Use rational exponents to solve problems


> **Note --- Where this fits**
>
> This is the foundation module. Exponents, roots, and polynomial moves come back constantly --- especially in **M06 Quadratic Functions** (factoring) and **M08 Exponential Functions**. Getting these automatic now pays off all term.


## 1. Exponent rules
An exponent is repeated multiplication: $a^n$ means $a$ multiplied by itself $n$ times. A handful of rules cover everything --- see the card **Exponent Rules**.

| Rule | Meaning | Example |
|---|---|---|
| Product | $a^m\cdot a^n=a^{m+n}$ | $x^3\cdot x^5=x^8$ |
| Quotient | $a^m/a^n=a^{m-n}$ | $x^7/x^2=x^5$ |
| Power | $(a^m)^n=a^{mn}$ | $(x^3)^5=x^{15}$ |
| Product to a power | $(ab)^n=a^n b^n$ | $(2x)^3=8x^3$ |
| Zero | $a^0=1$ | $7^0=1$ |
| Negative | $a^{-n}=\dfrac{1}{a^n}$ | $x^{-2}=\dfrac{1}{x^2}$ |

> **Example --- Worked example --- simplify $(3x^2)(4x^5)$**
>
> Multiply the coefficients, add the exponents: $3\cdot 4=12$ and $x^{2+5}=x^7$, giving **$12x^7$**.


## 2. Radicals and principal roots
A square root $\sqrt{a}$ asks: "what number squared gives $a$?" Every positive number has two square roots ($5$ and $-5$ both square to $25$), but the **principal** root is the non-negative one. See **Radicals and Principal Roots**.

![](Attachments/m01_principal_roots.png)

To simplify a radical, pull out perfect-square factors: $\sqrt{50}=\sqrt{25\cdot 2}=5\sqrt{2}$.

## 3. Rational (fractional) exponents
A fraction in the exponent means *both* a power and a root --- the bridge between sections 1 and 2:
$$a^{m/n}=\sqrt[n]{a^m}=\left(\sqrt[n]{a}\right)^m$$
The **denominator is the root**, the numerator is the power. See **Rational Exponents**.

> **Example --- Worked example --- evaluate $16^{3/4}$**
>
> Take the root first (smaller numbers): $\sqrt[4]{16}=2$, then the power: $2^3=$ **8**.


## 4. Polynomials
A polynomial is a sum of terms like $ax^n$ with whole-number exponents, e.g. $3x^2-5x+4$. See **Polynomials**.

- **Add / subtract** --- combine **like terms**: $(3x^2+2x)-(x^2-5x)=2x^2+7x$.
- **Multiply** --- distribute every term. For two binomials ("FOIL"): $(x+3)(x-5)=x^2-2x-15$.
- **Special products** --- $(a+b)^2=a^2+2ab+b^2$ and $(a+b)(a-b)=a^2-b^2$.

## 5. Factoring (intro)
Factoring is multiplying in reverse --- writing a polynomial as a product. It's the key to solving quadratics in **M06 Quadratic Functions**. See **Factoring**.

- **GCF:** $6x^2+9x=3x(2x+3)$
- **Trinomial:** $x^2+7x+12=(x+3)(x+4)$ --- two numbers that multiply to 12 and add to 7.
- **Difference of squares:** $x^2-9=(x-3)(x+3)$

> **Watch out --- Common traps**
>
> - $(2x)^3=8x^3$, not $2x^3$ --- the power hits the coefficient too.
> - In $a^{m/n}$, the **bottom** number is the root, not the top.
> - $\sqrt{a+b}\neq\sqrt{a}+\sqrt{b}$ --- you can't split a root over addition.
> - Distribute across **every** term: $-(x-4)=-x+4$.


## Practice
Work each on paper, then expand the solution. (All answers were double-checked symbolically.)

1. Simplify $(3x^2)(4x^5)$.
> **Solution --- Solution**
>
> Multiply 3$\cdot$4, add exponents 2+5 $\to$ **$12x^{7}$**.


2. Simplify $\dfrac{(x^4)^3}{x^5}$.
> **Solution --- Solution**
>
> $(x^4)^3=x^{12}$, then $x^{12}/x^5=$ **$x^{7}$**.


3. Evaluate $16^{3/4}$.
> **Solution --- Solution**
>
> $\sqrt[4]{16}=2$, then $2^3=$ **8**.


4. Multiply $(x+6)(x-2)$.
> **Solution --- Solution**
>
> $x^2-2x+6x-12=$ **$x^2+4x-12$**.


5. Factor $x^2+x-12$.
> **Solution --- Solution**
>
> Two numbers multiplying to $-12$, adding to $1$: $+4$ and $-3$ $\to$ **$(x+4)(x-3)$**.


6. *(stretch)* Simplify $(8x^6)^{1/3}$.
> **Solution --- Solution**
>
> $\sqrt[3]{8}=2$ and $\sqrt[3]{x^6}=x^2$ $\to$ **$2x^2$**.


## Connections
- Cards: **Exponent Rules** $\cdot$ **Rational Exponents** $\cdot$ **Radicals and Principal Roots** $\cdot$ **Polynomials** $\cdot$ **Factoring**
- Feeds forward into **M06 Quadratic Functions** and **M08 Exponential Functions**.

## Further reading
- OpenStax *College Algebra 2e* §1.2 Exponents, §1.3 Radicals & Rational Exponents, §1.4 Polynomials, §1.5 Factoring (in your folder; online links in **Resources**).
- Snapshot above: OpenStax *College Algebra 2e* §1.3 (CC BY 4.0).
